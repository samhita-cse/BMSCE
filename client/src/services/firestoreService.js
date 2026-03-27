import {
  get,
  onValue,
  push,
  query,
  ref,
  serverTimestamp,
  update,
  orderByChild,
  limitToLast,
  set
} from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../lib/firebase";

export function subscribeToDashboard(userId, callback) {
  const statsRef = ref(db, `users/${userId}/meta/stats`);
  const flashcardsQuery = query(
    ref(db, `users/${userId}/flashcards`),
    orderByChild("createdAt"),
    limitToLast(10)
  );
  const quizzesQuery = query(
    ref(db, `users/${userId}/quizAttempts`),
    orderByChild("createdAt"),
    limitToLast(10)
  );

  const cache = {
    stats: null,
    flashcards: [],
    quizzes: []
  };

  const emit = () => callback({ ...cache });

  const unsubStats = onValue(statsRef, (snapshot) => {
    cache.stats = snapshot.exists() ? snapshot.val() : null;
    emit();
  });

  const unsubFlashcards = onValue(flashcardsQuery, (snapshot) => {
    const value = snapshot.val() || {};
    cache.flashcards = Object.entries(value)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    emit();
  });

  const unsubQuizzes = onValue(quizzesQuery, (snapshot) => {
    const value = snapshot.val() || {};
    cache.quizzes = Object.entries(value)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    emit();
  });

  return () => {
    unsubStats();
    unsubFlashcards();
    unsubQuizzes();
  };
}

export async function incrementStudySession(userId, payload) {
  const statsRef = ref(db, `users/${userId}/meta/stats`);
  const statsSnapshot = await get(statsRef);
  const currentStats = statsSnapshot.val() || {};

  await update(statsRef, {
    totalStudyMinutes: (currentStats.totalStudyMinutes || 0) + payload.minutes,
    completedPomodoros: (currentStats.completedPomodoros || 0) + 1,
    updatedAt: serverTimestamp()
  });

  const sessionRef = push(ref(db, `users/${userId}/studySessions`));
  await set(sessionRef, {
    ...payload,
    createdAt: serverTimestamp()
  });
}

export async function saveGeneratedFlashcards(userId, topic, cards) {
  const flashcardRef = push(ref(db, `users/${userId}/flashcards`));
  await set(flashcardRef, {
    topic,
    cards,
    saved: true,
    createdAt: serverTimestamp()
  });

  return flashcardRef;
}

export async function saveQuizAttempt(userId, payload) {
  const attemptRef = push(ref(db, `users/${userId}/quizAttempts`));
  await set(attemptRef, {
    ...payload,
    createdAt: serverTimestamp()
  });

  const statsRef = ref(db, `users/${userId}/meta/stats`);
  await update(statsRef, {
    latestQuizTopic: payload.topic,
    latestQuizScore: payload.score,
    latestQuizTotal: payload.total,
    updatedAt: serverTimestamp()
  });
}

export async function updateWeakAreas(userId, weakAreas) {
  const statsRef = ref(db, `users/${userId}/meta/stats`);
  await update(statsRef, {
    weakAreas,
    updatedAt: serverTimestamp()
  });
}

export async function fetchRecentStudySessions(userId) {
  const snapshot = await get(
    query(ref(db, `users/${userId}/studySessions`), orderByChild("createdAt"), limitToLast(20))
  );
  const value = snapshot.val() || {};

  return Object.entries(value)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function updateSavedFlashcardFlag(userId, flashcardId, saved) {
  await update(ref(db, `users/${userId}/flashcards/${flashcardId}`), {
    saved
  });
}

export const generateStudyContent = httpsCallable(functions, "generateStudyContent");
export const analyzeWeakAreas = httpsCallable(functions, "analyzeWeakAreas");
