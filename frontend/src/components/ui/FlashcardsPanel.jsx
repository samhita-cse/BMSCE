import { useEffect, useState } from "react";

function buildLocalFlashcards(topic) {
  const cleanTopic = topic.trim();
  const words = cleanTopic.split(/\s+/).filter(Boolean);
  const pieces = words.length ? words : ["Core idea", "Definition", "Example", "Use", "Review"];

  return pieces.slice(0, 5).map((word, index) => ({
    id: index + 1,
    term: word,
    definition: `${word} is one important part of ${cleanTopic}. Review what it means, why it matters, and one example connected to it.`,
  }));
}

const navBtn = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text-2)",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
};

export default function FlashcardsPanel({
  topic = "",
  topicRequestKey = 0,
  cards = [],
  sourceLabel = "",
  onFilesSelected,
  pastedNotes = "",
  onPastedNotesChange,
  onSavePastedNotes,
}) {
  const [flashcards, setFlashcards] = useState(cards);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [known, setKnown] = useState(new Set());

  useEffect(() => {
    if (!topic && cards.length > 0) {
      setFlashcards(cards);
      setKnown(new Set());
      setCurrent(0);
      setFlipped(false);
    }
  }, [cards, topic]);

  async function fetchCards(forcedTopic = topic) {
    if (!forcedTopic.trim()) return;
    setLoading(true);
    setFlashcards([]);
    setKnown(new Set());
    setCurrent(0);
    setFlipped(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate 8 flashcards about "${forcedTopic}".
Return ONLY a JSON array of objects with: id (number), term (string), definition (string).
No markdown, no extra text.`,
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
        throw new Error("No flashcards");
      }
      setFlashcards(parsed);
    } catch {
      setFlashcards(buildLocalFlashcards(forcedTopic));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (topic.trim()) {
      fetchCards(topic);
    } else if (!cards.length) {
      setFlashcards([]);
      setKnown(new Set());
      setCurrent(0);
      setFlipped(false);
    }
  }, [topic, topicRequestKey]);

  const card = flashcards[current];
  const progress = flashcards.length > 0 ? (known.size / flashcards.length) * 100 : 0;

  function markKnown() {
    setKnown((s) => new Set([...s, card.id]));
    next();
  }

  function next() {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + 1) % flashcards.length), 150);
  }

  function prev() {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c - 1 + flashcards.length) % flashcards.length), 150);
  }

  const personalizedFlashcardsBox = (
    <div
      className="soft-panel"
      style={{
        padding: "18px 20px",
        marginBottom: 24,
      }}
    >
      <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>
        {topic ? "Want personalized flashcards instead?" : "Want personalized flashcards?"}
      </p>
      <p style={{ color: "var(--text-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>
        Attach your notes, PDF, DOC, DOCX, TXT, or pasted text and generate flashcards from your own material.
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
        {cards.length > 0 && (
          <button
            onClick={() => {
              setFlashcards(cards);
              setKnown(new Set());
              setCurrent(0);
              setFlipped(false);
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
        placeholder="Paste your notes here to make personalized flashcards..."
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
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            margin: 0,
            color: "var(--text)",
            letterSpacing: "-0.04em",
          }}
        >
          Flashcards
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.92rem", marginTop: 8 }}>
          Click a card to flip it
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--text-2)", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Current Topic
        </p>
        <p style={{ color: topic ? "var(--text)" : "var(--text-2)", fontSize: "1rem", fontWeight: 600, margin: "8px 0 0" }}>
          {topic || "Use the main search bar above to enter a topic first."}
        </p>
      </div>

      {!topic && personalizedFlashcardsBox}

      {flashcards.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "var(--text-2)", fontSize: "0.78rem" }}>
              Card {current + 1} of {flashcards.length}
            </span>
            <span style={{ color: "var(--teal)", fontSize: "0.78rem", fontWeight: 600 }}>
              {known.size} known ✓
            </span>
          </div>
          <div style={{ height: 3, background: "var(--rose-soft)", borderRadius: 4 }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #8a7dff, #6fd6d1)",
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {card && (
        <div
          onClick={() => setFlipped((f) => !f)}
          style={{
            perspective: 1200,
            cursor: "pointer",
            height: 260,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                background: "rgba(255,255,255,0.78)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 36px rgba(255, 215, 226, 0.16)",
              }}
            >
              <span
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 20,
                }}
              >
                Term
              </span>
              <p
                style={{
                  color: "var(--text)",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {card.term}
              </p>
              <span style={{ color: "var(--text-3)", fontSize: "0.72rem", marginTop: 24 }}>
                tap to reveal →
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "#f3f0ff",
                border: "1px solid rgba(138,125,255,0.28)",
                borderRadius: 20,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 36px rgba(224, 213, 255, 0.26)",
              }}
            >
              <span
                style={{
                  color: "var(--accent)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 20,
                }}
              >
                Definition
              </span>
              <p
                style={{
                  color: "var(--text-2)",
                  fontSize: "1rem",
                  textAlign: "center",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {card.definition}
              </p>
            </div>
          </div>
        </div>
      )}

      {flashcards.length > 0 && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={prev} style={navBtn}>← Prev</button>
          <button
            onClick={markKnown}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(52,199,161,0.4)",
              background: "var(--teal-soft)",
              color: "var(--teal)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ✓ Got it
          </button>
          <button onClick={next} style={navBtn}>Next →</button>
        </div>
      )}

      {topic && personalizedFlashcardsBox}
    </div>
  );
}
