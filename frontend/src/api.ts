export type AnalysisResponse = {
  move_count: number;
  san_moves: string[];
  metadata: {
    event?: string;
    site?: string;
    date?: string;
    white?: string;
    black?: string;
    result?: string;
  };
  white_player?: string;
  black_player?: string;
  result?: string;
  move_classifications: Array<{
    move_number: number;
    san: string;
    side: 'white' | 'black';
    classification: string;
    note: string;
  }>;
  coach: {
    provider: string;
    summary: string;
    key_takeaways: string[];
    suggested_training: string[];
    is_mock: boolean;
  };
};

export async function analyzePgn(pgn: string): Promise<AnalysisResponse> {
  const response = await fetch('/api/analyze-pgn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pgn, player_id: 'local-player' })
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.detail ?? 'The backend could not analyze this PGN.');
  }

  return response.json();
}
