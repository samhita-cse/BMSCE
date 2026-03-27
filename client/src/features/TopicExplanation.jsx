import { useState } from "react";
import { Panel } from "../components/Panel";
import { StatusMessage } from "../components/StatusMessage";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getTopicExplanation } from "../services/aiService";

export function TopicExplanation() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState(null);
  const { loading, error, run, clearError } = useAsyncTask(getTopicExplanation);

  const handleExplain = async () => {
    if (!topic.trim()) {
      return;
    }

    try {
      setContent(await run(topic));
    } catch {
      return;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleExplain();
    }
  };

  return (
    <Panel
      title="Topic Explanation"
      subtitle="Get one topic explained at three difficulty levels."
      actions={
        <button className="primary-button" onClick={handleExplain} type="button">
          {loading ? "Generating..." : "Explain"}
        </button>
      }
    >
      <div className="stack">
        <input
          className="text-input"
          placeholder="Enter a topic like photosynthesis, recursion, or World War I"
          value={topic}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            clearError();
            setTopic(event.target.value);
          }}
        />
        <StatusMessage
          error={error}
          loadingLabel={loading ? "Generating explanation with Claude..." : ""}
        />
        <div className="explanation-grid">
          {["simple", "medium", "advanced"].map((level) => (
            <article className="explanation-card" key={level}>
              <h3>{level}</h3>
              <p>{content?.explanations?.[level] || "No explanation generated yet."}</p>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
