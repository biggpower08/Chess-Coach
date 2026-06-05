import { UserRound } from 'lucide-react';

export function PlayerProfile() {
  return (
    <section className="panel">
      <div className="panel-heading">
        <UserRound size={18} aria-hidden="true" />
        <h2>Player Profile</h2>
      </div>
      <p className="muted">Strengths, weaknesses, and recurring patterns will live here.</p>
    </section>
  );
}
