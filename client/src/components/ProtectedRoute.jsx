import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="screen-center">Checking your session...</div>;
  }

  if (!user) {
    return <div className="screen-center">Please sign in to continue.</div>;
  }

  return children;
}
