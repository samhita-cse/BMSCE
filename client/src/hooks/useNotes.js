import { useEffect, useState } from "react";
import { subscribeToNotes } from "../services/notesService";

export function useNotes(userId) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    return subscribeToNotes(userId, setNotes);
  }, [userId]);

  return notes;
}
