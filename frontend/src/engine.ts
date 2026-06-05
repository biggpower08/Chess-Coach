import { fallbackEvaluateFen, type PositionEvaluation } from './chessLogic';

export type EngineStatus = 'loading' | 'ready' | 'analyzing' | 'fallback' | 'error';

type PendingRequest = {
  fen: string;
  resolve: (evaluation: PositionEvaluation) => void;
  timeout: number;
  lastEval: PositionEvaluation | null;
};

export class BrowserEngine {
  private worker: Worker | null = null;
  private ready = false;
  private pending: PendingRequest | null = null;
  private statusListener: (status: EngineStatus, message: string) => void;
  private settings = { depth: 12, multiPV: 1 };

  constructor(statusListener: (status: EngineStatus, message: string) => void) {
    this.statusListener = statusListener;
  }

  init() {
    this.statusListener('loading', 'Engine loading...');
    try {
      this.worker = new Worker(`${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`);
      this.worker.onmessage = (event) => this.handleMessage(String(event.data));
      this.worker.onerror = () => this.failToFallback('Stockfish worker error. Using material fallback.');
      this.post('uci');
    } catch {
      this.failToFallback('Stockfish unavailable. Using material fallback.');
    }
  }

  configure(depth: number, multiPV: number) {
    this.settings = { depth, multiPV };
    if (this.ready) this.post(`setoption name MultiPV value ${multiPV}`);
  }

  analyze(fen: string) {
    if (!this.ready || !this.worker) {
      this.statusListener('fallback', 'Using material fallback');
      return Promise.resolve(fallbackEvaluateFen(fen));
    }

    if (this.pending) {
      window.clearTimeout(this.pending.timeout);
      this.pending.resolve(fallbackEvaluateFen(this.pending.fen));
      this.pending = null;
    }

    this.statusListener('analyzing', `Analyzing depth ${this.settings.depth}...`);
    return new Promise<PositionEvaluation>((resolve) => {
      const timeout = window.setTimeout(() => {
        if (!this.pending) return;
        const fallback = this.pending.lastEval ?? fallbackEvaluateFen(fen);
        this.pending = null;
        this.statusListener('fallback', 'Engine timed out. Showing fallback eval.');
        resolve(fallback);
      }, Math.max(5000, this.settings.depth * 900));

      this.pending = { fen, resolve, timeout, lastEval: null };
      this.post('stop');
      this.post('ucinewgame');
      this.post(`setoption name MultiPV value ${this.settings.multiPV}`);
      this.post(`position fen ${fen}`);
      this.post(`go depth ${this.settings.depth}`);
    });
  }

  private handleMessage(line: string) {
    if (line === 'uciok') {
      this.ready = true;
      this.configure(this.settings.depth, this.settings.multiPV);
      this.statusListener('ready', 'Engine ready');
      return;
    }

    if (line.startsWith('info') && line.includes(' score ') && this.pending) {
      const multipv = line.match(/\bmultipv (\d+)/);
      if (multipv && Number(multipv[1]) > 1) return;

      const depth = Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0);
      const cp = line.match(/\bscore cp (-?\d+)/);
      const mate = line.match(/\bscore mate (-?\d+)/);
      const pv = line.match(/\bpv (.+)$/)?.[1]?.trim().split(/\s+/) ?? [];
      const sideToMove = this.pending.fen.split(' ')[1];
      const sign = sideToMove === 'b' ? -1 : 1;

      if (cp) {
        this.pending.lastEval = {
          score: { type: 'cp', value: Number(cp[1]) * sign },
          depth,
          pv,
          source: 'stockfish'
        };
      }

      if (mate) {
        this.pending.lastEval = {
          score: { type: 'mate', value: Number(mate[1]) * sign },
          depth,
          pv,
          source: 'stockfish'
        };
      }
    }

    if (line.startsWith('bestmove') && this.pending) {
      window.clearTimeout(this.pending.timeout);
      const evaluation = this.pending.lastEval ?? fallbackEvaluateFen(this.pending.fen);
      this.pending.resolve(evaluation);
      this.pending = null;
      this.statusListener('ready', `Depth ${evaluation.depth || 'fallback'}`);
    }
  }

  private failToFallback(message: string) {
    this.worker = null;
    this.ready = false;
    this.statusListener('fallback', message);
  }

  private post(message: string) {
    this.worker?.postMessage(message);
  }
}
