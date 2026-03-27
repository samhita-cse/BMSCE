import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { loginWithGoogle, authError } = useAuth();

  return (
    <main className="landing-shell">
      <section className="landing-card">
        <p className="eyebrow">StudyFlow</p>
        <h1>Study app for focus, quizzes, flashcards, and explanations.</h1>
        <p className="hero-copy">
          Sign in with Google to use a simple student dashboard powered by Firebase
          and Claude.
        </p>
        <ul className="simple-list">
          <li>Pomodoro timer with saved sessions</li>
          <li>Topic explanation in simple, medium, and advanced levels</li>
          <li>MCQ quiz generation with score tracking</li>
          <li>Flashcards and weak-area analysis</li>
        </ul>
        <button className="primary-button" onClick={loginWithGoogle} type="button">
          Continue with Google
        </button>
        {authError ? <p className="status-message error">{authError}</p> : null}
      </section>
    </main>
  );
}
