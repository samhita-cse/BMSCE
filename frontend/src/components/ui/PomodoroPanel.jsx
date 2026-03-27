import { useEffect, useRef, useState } from "react";

const MODES = [
  { label: "Focus", duration: 25 * 60, color: "#8a7dff", glow: "rgba(138,125,255,0.24)" },
  { label: "Short Break", duration: 5 * 60, color: "#6fd6d1", glow: "rgba(111,214,209,0.24)" },
  { label: "Long Break", duration: 15 * 60, color: "#ff7ba0", glow: "rgba(255,123,160,0.24)" },
];

export default function PomodoroPanel({ onStudyTick, onStateChange }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clockNow, setClockNow] = useState(() => new Date());
  const intervalRef = useRef(null);
  const fullscreenRef = useRef(null);
  const mode = MODES[modeIdx];

  useEffect(() => {
    setTimeLeft(MODES[modeIdx].duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIdx === 0) setSessions((s) => s + 1);
            return 0;
          }
          if (modeIdx === 0) onStudyTick?.();
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx, onStudyTick]);

  useEffect(() => {
    const tick = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    onStateChange?.({ running, timeLeft });
  }, [running, timeLeft, onStateChange]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const total = MODES[modeIdx].duration;
  const pct = ((total - timeLeft) / total) * 100;
  const r = isFullscreen ? 120 : 90;
  const center = isFullscreen ? 150 : 110;
  const svgSize = isFullscreen ? 300 : 220;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ - (pct / 100) * circ;

  function reset() {
    setRunning(false);
    setTimeLeft(MODES[modeIdx].duration);
  }

  async function enterFullscreen() {
    if (!fullscreenRef.current?.requestFullscreen) return;
    await fullscreenRef.current.requestFullscreen();
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement) return;
    await document.exitFullscreen();
  }

  const desktopTime = clockNow.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const shellStyle = isFullscreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background:
          "radial-gradient(circle at 50% 18%, rgba(255,214,229,0.9), transparent 24%), linear-gradient(180deg, #fff8fb 0%, #fff4f7 54%, #fffdfd 100%)",
        padding: "28px 32px 40px",
        display: "flex",
        flexDirection: "column",
      }
    : {
        maxWidth: 560,
        margin: "0 auto",
        padding: "24px 0",
        textAlign: "center",
      };

  const contentStyle = isFullscreen
    ? {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }
    : { textAlign: "center" };

  return (
    <div ref={fullscreenRef} style={shellStyle}>
      {isFullscreen && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
          <button
            onClick={exitFullscreen}
            style={{
              padding: "12px 18px",
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.84)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
            }}
          >
            Exit Full Screen
          </button>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.84)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "0.92rem",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            {desktopTime}
          </div>
        </div>
      )}

      <div style={contentStyle}>
        <div style={{ marginBottom: isFullscreen ? 40 : 32 }}>
          <h2 style={{ fontSize: isFullscreen ? "3.4rem" : "2.8rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.04em" }}>
            Pomodoro Timer
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: isFullscreen ? "1.08rem" : "0.98rem", marginTop: 8 }}>
            {sessions} session{sessions !== 1 ? "s" : ""} completed today
          </p>
        </div>

        <div
          className="soft-panel"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            margin: `0 auto ${isFullscreen ? 52 : 40}px`,
            padding: "6px",
            width: "fit-content",
            borderRadius: 18,
          }}
        >
          {MODES.map((m, i) => (
            <button
              key={i}
              onClick={() => setModeIdx(i)}
              style={{
                padding: isFullscreen ? "12px 24px" : "10px 18px",
                borderRadius: 12,
                border: "none",
                background: modeIdx === i ? `${m.color}33` : "transparent",
                color: modeIdx === i ? m.color : "var(--text-2)",
                fontWeight: modeIdx === i ? 700 : 500,
                fontSize: isFullscreen ? "1rem" : "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s",
                outline: modeIdx === i ? `1px solid ${m.color}55` : "none",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isFullscreen ? 52 : 40,
          }}
        >
          <svg width={svgSize} height={svgSize} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#f4dfea" strokeWidth={8} />
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={mode.color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 8px ${mode.glow})` }}
            />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div
              style={{
                fontSize: isFullscreen ? "4.8rem" : "3.2rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text)",
                lineHeight: 1,
              }}
            >
              {mins}:{secs}
            </div>
            <div
              style={{
                color: mode.color,
                fontSize: isFullscreen ? "1rem" : "0.82rem",
                fontWeight: 700,
                marginTop: 8,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {mode.label}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: isFullscreen ? "14px 28px" : "12px 24px",
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-2)",
              fontWeight: 600,
              fontSize: isFullscreen ? "1rem" : "0.92rem",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setRunning((value) => !value)}
            style={{
              padding: isFullscreen ? "14px 56px" : "12px 48px",
              borderRadius: 14,
              border: "none",
              background: running ? "#efeaff" : `linear-gradient(135deg, ${mode.color}dd, ${mode.color}99)`,
              color: running ? mode.color : "#fff",
              fontWeight: 800,
              fontSize: isFullscreen ? "1.08rem" : "1rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: running ? "none" : `0 10px 24px ${mode.glow}`,
            }}
          >
            {running ? "Pause" : "▶ Start"}
          </button>
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              style={{
                padding: "12px 20px",
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.78)",
                color: "var(--text)",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
              }}
            >
              Full Screen
            </button>
          )}
        </div>

        {sessions > 0 && (
          <div style={{ marginTop: 40, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: mode.color,
                  boxShadow: `0 0 6px ${mode.glow}`,
                  opacity: 0.8,
                }}
              />
            ))}
            {sessions > 12 && <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>+{sessions - 12}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
