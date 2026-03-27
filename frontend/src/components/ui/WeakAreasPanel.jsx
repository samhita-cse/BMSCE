export default function WeakAreasPanel({ weakAreas = [], onGoToQuiz }) {
  const hasTips = weakAreas.length > 0;

  const suggestions = [
    "Re-read your notes on this topic",
    "Try explaining it out loud to yourself",
    "Use the Explanation panel to break it down more simply",
    "Quiz yourself again after reviewing",
  ];

  const accentColors = [
    { bg: "#fff1f4", border: "rgba(255,95,135,0.24)", tag: "#ffe2ea", tagText: "#e8638b", num: "#ffd7e2", numText: "#df4f78" },
    { bg: "#fff9e8", border: "rgba(245,184,75,0.26)", tag: "#fff1cb", tagText: "#cf9626", num: "#ffe7a5", numText: "#c78a10" },
    { bg: "#f8f1ff", border: "rgba(138,125,255,0.24)", tag: "#efe5ff", tagText: "#8a7dff", num: "#e3d8ff", numText: "#7768ef" },
    { bg: "#ebfbf8", border: "rgba(111,214,209,0.28)", tag: "#dbfbf2", tagText: "#2db5ad", num: "#c7f6eb", numText: "#1d9e95" },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.04em" }}>
          Weak Areas
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.98rem", marginTop: 8 }}>
          Based on your quiz — topics that need more work
        </p>
      </div>

      {!hasTips ? (
        <div
          className="soft-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            textAlign: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "#efeaff",
              border: "1px solid rgba(138,125,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
            }}
          >
            🎯
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", margin: "0 0 8px", fontSize: "1rem" }}>
              No weak areas yet
            </p>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", margin: 0 }}>
              Complete a quiz to see which topics need more work.
            </p>
          </div>
          <button
            onClick={onGoToQuiz}
            style={{
              background: "#efeaff",
              border: "1px solid rgba(138,125,255,0.25)",
              borderRadius: 12,
              padding: "10px 20px",
              color: "#8a7dff",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Head to Quiz and take a test first
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {weakAreas.map((area, i) => {
            const c = accentColors[i % accentColors.length];
            return (
              <div
                key={i}
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 18,
                  padding: "16px 20px",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  animation: `fadeIn 0.3s ease ${i * 0.07}s both`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: c.num,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.numText,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.94rem", margin: "0 0 6px" }}>
                    {area}
                  </p>
                  <p style={{ color: "var(--text-2)", fontSize: "0.84rem", margin: 0 }}>
                    {suggestions[i % suggestions.length]}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    background: c.tag,
                    color: c.tagText,
                    border: `1px solid ${c.border}`,
                    padding: "4px 10px",
                    borderRadius: 20,
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  Review
                </span>
              </div>
            );
          })}

          <div
            className="soft-panel"
            style={{
              background: "#f8f5ff",
              borderColor: "rgba(138,125,255,0.22)",
              padding: "18px 20px",
              marginTop: 6,
            }}
          >
            <p style={{ color: "#8a7dff", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 6px" }}>
              What to do next
            </p>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
              Open the Explanation panel, type one of these topics, and ask for a simpler breakdown. Then come back and try the quiz again.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
