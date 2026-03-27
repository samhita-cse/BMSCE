import { Panel } from "../components/Panel";

export function WeakAreaPanel({ weakAreas }) {
  return (
    <Panel
      title="Weak Area Detection"
      subtitle="Quiz trends and targeted improvement suggestions."
    >
      <div className="weak-area-list">
        {weakAreas?.length ? (
          weakAreas.map((area, index) => (
            <article className="weak-card" key={`${area.topic}-${index}`}>
              <h3>{area.topic}</h3>
              <p>{area.reason}</p>
              <span>{area.suggestion}</span>
            </article>
          ))
        ) : (
          <p className="muted">
            No weak areas detected yet. Finish a quiz to get personalized analysis.
          </p>
        )}
      </div>
    </Panel>
  );
}
