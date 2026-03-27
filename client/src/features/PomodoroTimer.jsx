import { useEffect, useRef, useState } from "react";
import { Panel } from "../components/Panel";

const DEFAULTS = {
  focusMinutes: 25,
  breakMinutes: 5
};

export function PomodoroTimer({
  onSessionComplete,
  isStudyFullscreen,
  onEnterFullscreen,
  onExitFullscreen
}) {
  const [focusMinutes, setFocusMinutes] = useState(DEFAULTS.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.focusMinutes * 60);
  const [phaseEndsAt, setPhaseEndsAt] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const focusMinutesRef = useRef(focusMinutes);
  const breakMinutesRef = useRef(breakMinutes);
  const modeRef = useRef(mode);
  const completedSessionsRef = useRef(completedSessions);
  const phaseEndsAtRef = useRef(phaseEndsAt);

  useEffect(() => {
    focusMinutesRef.current = focusMinutes;
  }, [focusMinutes]);

  useEffect(() => {
    breakMinutesRef.current = breakMinutes;
  }, [breakMinutes]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    completedSessionsRef.current = completedSessions;
  }, [completedSessions]);

  useEffect(() => {
    phaseEndsAtRef.current = phaseEndsAt;
  }, [phaseEndsAt]);

  useEffect(() => {
    const clockTimer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  const getDurationSeconds = (nextMode) =>
    (nextMode === "focus" ? focusMinutesRef.current : breakMinutesRef.current) * 60;

  const syncTimer = () => {
    const endAt = phaseEndsAtRef.current;
    if (!endAt) {
      return;
    }

    const now = Date.now();
    let nextMode = modeRef.current;
    let nextEndAt = endAt;
    let nextCompleted = completedSessionsRef.current;

    while (now >= nextEndAt) {
      if (nextMode === "focus") {
        nextCompleted += 1;
        completedSessionsRef.current = nextCompleted;
        setCompletedSessions(nextCompleted);
        onSessionComplete({
          minutes: focusMinutesRef.current,
          completedSessions: nextCompleted,
          modeCompleted: "focus"
        });
      }

      nextMode = nextMode === "focus" ? "break" : "focus";
      nextEndAt += getDurationSeconds(nextMode) * 1000;
    }

    if (nextMode !== modeRef.current) {
      modeRef.current = nextMode;
      setMode(nextMode);
    }

    if (nextEndAt !== phaseEndsAtRef.current) {
      phaseEndsAtRef.current = nextEndAt;
      setPhaseEndsAt(nextEndAt);
    }

    setSecondsLeft(Math.max(1, Math.ceil((nextEndAt - now) / 1000)));
  };

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    syncTimer();
    const timer = window.setInterval(syncTimer, 250);

    return () => window.clearInterval(timer);
  }, [isRunning, onSessionComplete]);

  useEffect(() => {
    if (!isRunning && mode === "focus") {
      setSecondsLeft(focusMinutes * 60);
    }
  }, [focusMinutes, isRunning, mode]);

  useEffect(() => {
    if (!isRunning && mode === "break") {
      setSecondsLeft(breakMinutes * 60);
    }
  }, [breakMinutes, isRunning, mode]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const totalSeconds = getDurationSeconds(mode);
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const timeLabel = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const resetTimer = () => {
    setIsRunning(false);
    setPhaseEndsAt(null);
    setMode("focus");
    setSecondsLeft(focusMinutes * 60);
  };

  const startTimer = () => {
    if (isRunning) {
      return;
    }

    const nextEndAt = Date.now() + secondsLeft * 1000;
    phaseEndsAtRef.current = nextEndAt;
    setPhaseEndsAt(nextEndAt);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (!isRunning) {
      return;
    }

    syncTimer();
    phaseEndsAtRef.current = null;
    setPhaseEndsAt(null);
    setIsRunning(false);
  };

  const actions = (
    <div className="button-row timer-mode-actions">
      <button
        className="ghost-button"
        onClick={isStudyFullscreen ? onExitFullscreen : onEnterFullscreen}
        type="button"
      >
        {isStudyFullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>
    </div>
  );

  const timerFace = (
    <div className={`progress-ring tomato-ring ${mode === "break" ? "break-mode" : "focus-mode"}`} style={{ "--progress": `${progress}%` }}>
      <div className="tomato-shell">
        <div className="tomato-body">
          <div className="tomato-rind" />
          <div className="tomato-cut" />
          <span className="tomato-seed seed-1" />
          <span className="tomato-seed seed-2" />
          <span className="tomato-seed seed-3" />
          <span className="tomato-seed seed-4" />
          <span className="tomato-vein vein-1" />
          <span className="tomato-vein vein-2" />
          <span className="tomato-vein vein-3" />
          <span className="tomato-vein vein-4" />
        </div>
        <div className="timer-overlay">
          <span>{mode}</span>
          <strong>
            {minutes}:{seconds}
          </strong>
        </div>
      </div>
    </div>
  );

  if (isStudyFullscreen) {
    return (
      <section className="focus-fullscreen-shell">
        <button className="ghost-button fullscreen-exit-button" onClick={onExitFullscreen} type="button">
          Exit fullscreen
        </button>

        <div className="focus-timer-card">
          <div className="fullscreen-ring">{timerFace}</div>

          <div className="focus-timer-actions">
            <button className="primary-button" onClick={startTimer} type="button">
              Start
            </button>
            <button className="ghost-button" onClick={pauseTimer} type="button">
              Pause
            </button>
            <button className="ghost-button" onClick={resetTimer} type="button">
              Reset
            </button>
          </div>
        </div>

        <div className="focus-clock-corner">{timeLabel}</div>
      </section>
    );
  }

  return (
    <Panel
      title="Pomodoro Timer"
      subtitle="Custom focus and break blocks with tracked completions."
      actions={actions}
    >
      <div className="timer-grid">
        <div className="timer-display">
          {timerFace}
          <p>{completedSessions} sessions finished today</p>
        </div>

        <div className="timer-controls">
          <label>
            Focus minutes
            <input
              min="1"
              type="number"
              value={focusMinutes}
              onChange={(event) => setFocusMinutes(Number(event.target.value) || 1)}
            />
          </label>
          <label>
            Break minutes
            <input
              min="1"
              type="number"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(Number(event.target.value) || 1)}
            />
          </label>
          <div className="button-row">
            <button className="primary-button" onClick={startTimer} type="button">
              Start
            </button>
            <button className="ghost-button" onClick={pauseTimer} type="button">
              Pause
            </button>
            <button className="ghost-button" onClick={resetTimer} type="button">
              Reset
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
