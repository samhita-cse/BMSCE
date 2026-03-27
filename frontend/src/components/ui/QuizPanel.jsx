import { useEffect, useState } from "react";

function buildLocalQuiz(topic) {
  const cleanTopic = topic.trim();
  const base = cleanTopic.split(/\s+/).filter(Boolean).slice(0, 3).join(" ");

  return [
    {
      id: 1,
      question: `Which option best describes ${cleanTopic}?`,
      options: [
        `${cleanTopic} is a concept/topic you are studying`,
        `${cleanTopic} is a random unrelated movie`,
        `${cleanTopic} is always a country`,
        `${cleanTopic} has no definition at all`,
      ],
      correct: 0,
    },
    {
      id: 2,
      question: `What is the best first step when learning ${cleanTopic}?`,
      options: [
        "Memorize every detail immediately",
        "Understand the core idea first",
        "Skip the definition completely",
        "Avoid examples",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: `A good way to remember ${base || cleanTopic} is to:`,
      options: [
        "Explain it in your own words",
        "Never review it again",
        "Ignore weak areas",
        "Only read the title",
      ],
      correct: 0,
    },
    {
      id: 4,
      question: `Which study action helps most after reviewing ${cleanTopic}?`,
      options: [
        "Take a quick quiz",
        "Close everything immediately",
        "Avoid checking understanding",
        "Skip practice",
      ],
      correct: 0,
    },
    {
      id: 5,
      question: `Why are examples useful for ${cleanTopic}?`,
      options: [
        "They connect the idea to something real",
        "They make learning impossible",
        "They remove all meaning",
        "They are never needed",
      ],
      correct: 0,
    },
  ];
}

export default function QuizPanel({
  topic = "",
  topicRequestKey = 0,
  onWeakAreas,
  questions: sourceQuestions = [],
  sourceLabel = "",
  onFilesSelected,
  pastedNotes = "",
  onPastedNotesChange,
  onSavePastedNotes,
}) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!topic && sourceQuestions.length > 0) {
      setQuestions(sourceQuestions);
      setSelected({});
      setSubmitted(false);
      setScore(null);
      setCurrentIndex(0);
    }
  }, [sourceQuestions, topic]);

  async function fetchQuiz(forcedTopic = topic) {
    if (!forcedTopic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setSelected({});
    setSubmitted(false);
    setScore(null);
    setCurrentIndex(0);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate a 5-question multiple choice quiz about "${forcedTopic}".
Return ONLY a JSON array of objects with: id (number), question (string), options (array of 4 strings), correct (index 0-3).
No markdown, no explanation.`,
          }],
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      if (!Array.isArray(parsed) || !parsed.length) {
        throw new Error("No quiz");
      }

      setQuestions(parsed);
    } catch {
      setQuestions(buildLocalQuiz(forcedTopic));
    }

    setLoading(false);
  }

  useEffect(() => {
    if (topic.trim()) {
      fetchQuiz(topic);
    } else if (!sourceQuestions.length) {
      setQuestions([]);
      setSelected({});
      setSubmitted(false);
      setScore(null);
      setCurrentIndex(0);
    }
  }, [topic, topicRequestKey]);

  function handleSubmit() {
    let correct = 0;
    const weak = [];
    questions.forEach((q) => {
      if (selected[q.id] === q.correct) correct += 1;
      else weak.push(q.question.slice(0, 60));
    });
    setScore(correct);
    setSubmitted(true);
    onWeakAreas?.(weak);
  }

  const allAnswered = questions.length > 0 && questions.every((q) => selected[q.id] !== undefined);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? selected[currentQuestion.id] : undefined;
  const wrongCount = submitted && score !== null ? questions.length - score : 0;

  function handleNextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  const personalizedQuizBox = (
    <div
      className="soft-panel"
      style={{
        padding: "18px 20px",
        marginBottom: 24,
      }}
    >
      <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>
        {topic ? "Want a personalized quiz instead?" : "Want a personalized quiz?"}
      </p>
      <p style={{ color: "var(--text-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>
        Attach your notes, PDF, DOC, DOCX, TXT, or pasted text and generate a quiz from your own material.
        {sourceLabel ? ` Using ${sourceLabel} right now.` : ""}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <label
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-2)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.86rem",
          }}
        >
          Attach PDF / DOC / TXT
          <input type="file" multiple accept=".pdf,.txt,.md,.doc,.docx" onChange={onFilesSelected} style={{ display: "none" }} />
        </label>
        <button
          onClick={onSavePastedNotes}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-2)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.86rem",
          }}
        >
          Save Pasted Notes
        </button>
        {sourceQuestions.length > 0 && (
          <button
            onClick={() => {
              setQuestions(sourceQuestions);
              setSelected({});
              setSubmitted(false);
              setScore(null);
              setCurrentIndex(0);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #7f83f8, #6fd6d1)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.86rem",
            }}
          >
            Generate From Notes
          </button>
        )}
      </div>

      <textarea
        value={pastedNotes}
        onChange={(e) => onPastedNotesChange?.(e.target.value)}
        placeholder="Paste your class notes or study guide here..."
        style={{
          width: "100%",
          minHeight: 110,
          resize: "vertical",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "12px 14px",
          color: "var(--text)",
          fontSize: "0.9rem",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.04em" }}>
          Quiz Mode
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.98rem", marginTop: 8 }}>Test your knowledge</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--text-2)", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Current Topic
        </p>
        <p style={{ color: topic ? "var(--text)" : "var(--text-2)", fontSize: "1rem", fontWeight: 600, margin: "8px 0 0" }}>
          {topic || "Use the main search bar above to enter a topic first."}
        </p>
      </div>

      {!topic && personalizedQuizBox}

      {submitted && score !== null && (
        <div
          className="soft-panel"
          style={{
            background: score >= 4 ? "#ecfff8" : score >= 3 ? "#fff8e8" : "#fff0f5",
            borderColor: score >= 4 ? "rgba(52,199,161,0.3)" : score >= 3 ? "rgba(245,184,75,0.3)" : "rgba(255,95,135,0.28)",
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: "2rem" }}>{score >= 4 ? "🎯" : score >= 3 ? "📚" : "💪"}</span>
          <div>
            <p style={{ color: "var(--text)", fontWeight: 700, margin: 0 }}>
              {score} / {questions.length} correct
            </p>
            <p style={{ color: "var(--text-2)", fontSize: "0.84rem", margin: "4px 0 0" }}>
              {score >= 4 ? "Excellent work!" : score >= 3 ? "Good job! Review weak areas." : "Keep going — you’re improving."}
            </p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ color: "#1e9b7b", fontWeight: 700, fontSize: "0.82rem", margin: 0 }}>{score} right</p>
            <p style={{ color: "#df4f78", fontWeight: 700, fontSize: "0.82rem", margin: "4px 0 0" }}>{wrongCount} wrong</p>
          </div>
        </div>
      )}

      {currentQuestion && (
        <div
          className="soft-panel"
          style={{
            padding: "22px",
            animation: "fadeIn 0.25s ease both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ color: "var(--text-3)", fontSize: "0.82rem", fontWeight: 700, margin: 0 }}>
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div
              style={{
                minWidth: 54,
                textAlign: "center",
                padding: "6px 10px",
                borderRadius: 999,
                background: "#efeaff",
                color: "var(--accent)",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {currentIndex + 1}/{questions.length}
            </div>
          </div>

          <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "1rem", marginBottom: 18, lineHeight: 1.6 }}>
            <span style={{ color: "var(--accent)", marginRight: 8 }}>Q.</span>
            {currentQuestion.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map((opt, oi) => {
              let bg = "var(--surface-2)";
              let border = "var(--border)";
              let color = "var(--text-2)";

              if (submitted) {
                if (oi === currentQuestion.correct) {
                  bg = "#e5fbf5";
                  border = "rgba(52,199,161,0.35)";
                  color = "#1e9b7b";
                } else if (oi === currentAnswer && currentAnswer !== currentQuestion.correct) {
                  bg = "#ffe8ef";
                  border = "rgba(255,95,135,0.28)";
                  color = "#df4f78";
                }
              } else if (currentAnswer === oi) {
                bg = "#efeaff";
                border = "rgba(138,125,255,0.42)";
                color = "#8a7dff";
              }

              return (
                <button
                  key={oi}
                  onClick={() => !submitted && setSelected((s) => ({ ...s, [currentQuestion.id]: oi }))}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: bg,
                    border: `1px solid ${border}`,
                    color,
                    fontSize: "0.92rem",
                    cursor: submitted ? "default" : "pointer",
                    transition: "all 0.18s",
                    fontFamily: "inherit",
                    fontWeight: currentAnswer === oi ? 600 : 400,
                  }}
                >
                  <span style={{ marginRight: 10, opacity: 0.5 }}>{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: currentIndex === 0 ? "#faf4f6" : "var(--surface-2)",
                color: currentIndex === 0 ? "var(--text-3)" : "var(--text-2)",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>

            {!submitted ? (
              currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: allAnswered ? "linear-gradient(135deg, #7f83f8, #6fd6d1)" : "var(--surface-2)",
                    color: allAnswered ? "#fff" : "var(--text-3)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: allAnswered ? "pointer" : "not-allowed",
                  }}
                >
                  Submit Quiz →
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentAnswer === undefined}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: currentAnswer !== undefined ? "linear-gradient(135deg, #7f83f8, #6fd6d1)" : "var(--surface-2)",
                    color: currentAnswer !== undefined ? "#fff" : "var(--text-3)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: currentAnswer !== undefined ? "pointer" : "not-allowed",
                  }}
                >
                  Next Question →
                </button>
              )
            ) : (
              <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                {currentIndex < questions.length - 1 && (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                    }}
                  >
                    Next Question →
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelected({});
                    setSubmitted(false);
                    setScore(null);
                    setCurrentIndex(0);
                  }}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #7f83f8, #6fd6d1)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {topic && personalizedQuizBox}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
