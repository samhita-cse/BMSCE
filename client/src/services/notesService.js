import {
  get,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set
} from "firebase/database";
import { db } from "../lib/firebase";

export async function saveStudentNote(userId, payload) {
  const noteRef = push(ref(db, `users/${userId}/notes`));
  await set(noteRef, {
    title: payload.title,
    text: payload.text,
    sourceType: payload.sourceType || "manual",
    fileName: payload.fileName || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return noteRef;
}

export function subscribeToNotes(userId, callback) {
  const notesQuery = query(
    ref(db, `users/${userId}/notes`),
    orderByChild("createdAt"),
    limitToLast(20)
  );

  return onValue(notesQuery, (snapshot) => {
    const value = snapshot.val() || {};
    const notes = Object.entries(value)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(notes);
  });
}

export async function fetchSavedNotes(userId) {
  const snapshot = await get(
    query(ref(db, `users/${userId}/notes`), orderByChild("createdAt"), limitToLast(20))
  );
  const value = snapshot.val() || {};

  return Object.entries(value)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
