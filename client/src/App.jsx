import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="screen-center">Loading StudyFlow...</div>;
  }

  return user ? (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ) : (
    <LandingPage />
  );
}

export default App;
