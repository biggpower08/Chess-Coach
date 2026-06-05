import { Dumbbell } from 'lucide-react';

type TrainingPlanProps = {
  items: string[];
};

export function TrainingPlan({ items }: TrainingPlanProps) {
  const trainingItems =
    items.length > 0
      ? items
      : ['Review the largest eval swing.', 'Replay the best engine line.', 'Practice the same tactical theme.'];

  return (
    <section className="panel">
      <div className="panel-heading">
        <Dumbbell size={18} aria-hidden="true" />
        <h2>Training Plan</h2>
      </div>
      <ul>
        {trainingItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
