import { useEffect, useState } from "react";
import { subscribeToDashboard } from "../services/firestoreService";

export function useDashboardData(userId) {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    flashcards: [],
    quizzes: []
  });

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    return subscribeToDashboard(userId, setDashboardData);
  }, [userId]);

  return dashboardData;
}
