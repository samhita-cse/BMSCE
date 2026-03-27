import { useEffect, useState } from "react";

const LEVELS = ["very simple", "simple", "normal", "detailed", "advanced"];

const KEY_TERM_COLORS = [
  { border: "rgba(138,125,255,0.35)", text: "#8a7dff" },
  { border: "rgba(111,214,209,0.35)", text: "#2db5ad" },
  { border: "rgba(255,95,135,0.32)", text: "#e8638b" },
  { border: "rgba(245,184,75,0.35)", text: "#cf9626" },
  { border: "rgba(91,141,239,0.3)", text: "#5b8def" },
];

function buildLocalExplanation(topic, levelIndex) {
  const cleanTopic = topic.trim();
  const words = cleanTopic.split(/\s+/).filter(Boolean);
  const focus = words[0] || "This topic";
  const levelTone = [
    "Think of it as the easiest possible version of the idea.",
    "Here is a simple explanation with less jargon.",
    "Here is a balanced explanation with the main details.",
    "Here is a more detailed explanation with a bit more depth.",
    "Here is a higher-level explanation with stronger conceptual detail.",
  ][levelIndex] || "Here is a balanced explanation.";

  const explanation = [
    `${cleanTopic} is a topic you can understand best by breaking it into smaller pieces. ${levelTone}`,
    `${focus} usually involves a core idea, the way that idea works, and why it matters in real use. When you study it, focus on the definition first, then the process, and then one practical example so it sticks better.`,
    `A good way to remember ${cleanTopic} is to connect it to something familiar, explain it in your own words, and then test yourself with one or two quick questions. That usually shows whether you really understand it or just recognize the words.`,
  ].join("\n\n");

  const keyTerms = words.slice(0, 5).map((word, index) => ({
    term: word.replace(/[^\w-]/g, "") || `Key idea ${index + 1}`,
    definition: `${word} is one important part of ${cleanTopic}. Review what it means and how it connects to the bigger concept.`,
  }));

  return { explanation, keyTerms };
}

export default function ExplanationPanel({ topic = "", topicRequestKey = 0 }) {
  const [level, setLevel] = useState(2);
  const [explanation, setExplanation] = useState(null);
  const [keyTerms, setKeyTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchExplanation(t, l) {
    setLoading(true);
    setExplanation(null);
    setKeyTerms([]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Explain "${t}" at a ${LEVELS[l]} level. 
Return a JSON object with exactly two keys:
- "explanation": a clear explanation string (2-4 paragraphs)
- "keyTerms": an array of {term, definition} objects (3-6 terms)
Return ONLY the JSON, no markdown.`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      if (!parsed.explanation) {
        throw new Error("Missing explanation");
      }

      setExplanation(parsed.explanation);
      setKeyTerms(parsed.keyTerms || []);
    } catch {
      const fallback = buildLocalExplanation(t, l);
      setExplanation(fallback.explanation);
      setKeyTerms(fallback.keyTerms);
    }

    setLoading(false);
  }

  function handleGenerate() {
    if (!topic.trim()) return;
    fetchExplanation(topic, level);
  }

  useEffect(() => {
    if (topic.trim()) {
      fetchExplanation(topic, level);
    } else {
      setExplanation(null);
      setKeyTerms([]);
    }
  }, [topic, topicRequestKey]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: "2.8rem",
            fontWeight: 800,
            color: "var(--text)",
            margin: 0,
            letterSpacing: "-0.04em",
          }}
        >
          Explain It
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.98rem", marginTop: 8 }}>
          Get any concept explained at your level
        </p>
      </div>

      <div
        className="soft-panel"
        style={{
          padding: "28px",
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <p
            style={{
              color: "var(--text-2)",
              fontSize: "0.74rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Current Topic
          </p>
          <p style={{ color: topic ? "var(--text)" : "var(--text-2)", fontSize: "1rem", fontWeight: 600, margin: "8px 0 0" }}>
            {topic || "Use the main search bar above to enter a topic first."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
            justifyContent: "center",
          }}
        >
          {LEVELS.map((lbl, i) => (
            <button
              key={i}
              onClick={() => setLevel(i)}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                borderColor: level === i ? "#8a7dff" : "transparent",
                background: level === i ? "#efeaff" : "transparent",
                color: level === i ? "#8a7dff" : "var(--text-2)",
                transition: "all 0.2s",
                textTransform: "lowercase",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            border: "none",
            background: loading ? "#d9d4ff" : "linear-gradient(135deg, #7f83f8, #6fd6d1)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
            opacity: topic.trim() ? 1 : 0.7,
            transition: "all 0.2s",
            letterSpacing: "0.03em",
          }}
        >
          {loading ? "Thinking..." : "Explain →"}
        </button>
      </div>

      {explanation && (
        <div
          className="soft-panel"
          style={{
            padding: "24px",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <p
            style={{
              color: "var(--text-2)",
              fontSize: "0.98rem",
              lineHeight: 1.8,
              marginBottom: 24,
              whiteSpace: "pre-wrap",
            }}
          >
            {explanation}
          </p>

          {keyTerms.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
              <p
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Key Terms
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {keyTerms.map((kt, i) => {
                  const c = KEY_TERM_COLORS[i % KEY_TERM_COLORS.length];
                  return (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.82)",
                        border: `1px solid ${c.border}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: c.text, fontWeight: 700, fontSize: "0.82rem", minWidth: 90 }}>
                        {kt.term}
                      </span>
                      <span style={{ color: "var(--text-2)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                        {kt.definition}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
