import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { MetricCard } from "../components/MetricCard";
import { PomodoroTimer } from "../features/PomodoroTimer";
import { TopicExplanation } from "../features/TopicExplanation";
import { QuizGenerator } from "../features/QuizGenerator";
import { Flashcards } from "../features/Flashcards";
import { WeakAreaPanel } from "../features/WeakAreaPanel";
import { NotesWorkspace } from "../features/NotesWorkspace";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { incrementStudySession } from "../services/firestoreService";

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, flashcards, quizzes } = useDashboardData(user.uid);
  const [savingSession, setSavingSession] = useState(false);
  const [isStudyFullscreen, setIsStudyFullscreen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === mainRef.current;
      setIsStudyFullscreen(isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleSessionComplete = async (payload) => {
    setSavingSession(true);
    try {
      await incrementStudySession(user.uid, payload);
    } finally {
      setSavingSession(false);
    }
  };

  const handleEnterFullscreen = async () => {
    if (!mainRef.current?.requestFullscreen) {
      return;
    }

    await mainRef.current.requestFullscreen();
  };

  const handleExitFullscreen = async () => {
    if (!document.fullscreenElement) {
      return;
    }

    await document.exitFullscreen();
  };

  const shellClassName = ["app-shell", isStudyFullscreen ? "study-fullscreen" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClassName} ref={mainRef}>
      <div className="fullscreen-header-slot">
        <Header />
      </div>

      <section className="metrics-grid fullscreen-metrics-slot">
        <MetricCard
          label="Study time"
          value={`${stats?.totalStudyMinutes || 0} min`}
          helper="Tracked from completed focus sessions"
        />
        <MetricCard
          label="Completed pomodoros"
          value={stats?.completedPomodoros || 0}
          helper={savingSession ? "Syncing latest session..." : "Realtime Database synced"}
        />
        <MetricCard
          label="Progress"
          value={
            stats?.latestQuizScore != null
              ? `${stats.latestQuizScore}/${stats.latestQuizTotal || 0}`
              : "No quiz yet"
          }
          helper={stats?.latestQuizTopic || "Take a quiz to measure progress"}
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-slot notes-slot">
          <NotesWorkspace userId={user.uid} />
        </div>
        <div className="dashboard-slot timer-slot">
          <PomodoroTimer
            isStudyFullscreen={isStudyFullscreen}
            onEnterFullscreen={handleEnterFullscreen}
            onExitFullscreen={handleExitFullscreen}
            onSessionComplete={handleSessionComplete}
          />
        </div>
        <div className="dashboard-slot weak-slot">
          <WeakAreaPanel weakAreas={stats?.weakAreas} />
        </div>
        <div className="dashboard-slot explanation-slot">
          <TopicExplanation />
        </div>
        <div className="dashboard-slot quiz-slot">
          <QuizGenerator userId={user.uid} recentQuizzes={quizzes} />
        </div>
        <div className="dashboard-slot flashcards-slot">
          <Flashcards userId={user.uid} savedDecks={flashcards} />
        </div>
      </section>
    </main>
  );
}
