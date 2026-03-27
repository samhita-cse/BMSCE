import { useState } from "react";
import { motion } from "framer-motion";
import { Panel } from "../components/Panel";
import { StatusMessage } from "../components/StatusMessage";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getFlashcards } from "../services/aiService";
import {
  saveGeneratedFlashcards,
  updateSavedFlashcardFlag
} from "../services/firestoreService";

export function Flashcards({ userId, savedDecks }) {
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const { loading, error, run, clearError } = useAsyncTask(getFlashcards);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    try {
      const response = await run(topic);
      const nextCards = response.flashcards || [];
      setCards(nextCards);
      await saveGeneratedFlashcards(userId, topic, nextCards);
    } catch {
      setCards([]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Panel
      title="Flashcards"
      subtitle="Generate fast revision cards and save them for later review."
      actions={
        <button className="primary-button" onClick={handleGenerate} type="button">
          {loading ? "Generating..." : "Generate cards"}
        </button>
      }
    >
      <div className="stack">
        <input
          className="text-input"
          placeholder="Topic for flashcards"
          value={topic}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            clearError();
            setTopic(event.target.value);
          }}
        />
        <StatusMessage
          error={error}
          loadingLabel={loading ? "Generating flashcards with Claude..." : ""}
        />

        <div className="flashcard-grid">
          {cards.map((card, index) => {
            const isFlipped = flipped[index];
            return (
              <motion.button
                className={`flashcard ${isFlipped ? "flipped" : ""}`}
                key={`${card.front}-${index}`}
                type="button"
                whileHover={{ y: -4 }}
                onClick={() =>
                  setFlipped((current) => ({ ...current, [index]: !current[index] }))
                }
              >
                <div className="flashcard-inner">
                  <div className="flashcard-face">
                    <span>Question</span>
                    <strong>{card.front}</strong>
                  </div>
                  <div className="flashcard-face flashcard-back">
                    <span>Answer</span>
                    <strong>{card.back}</strong>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="saved-list">
          {savedDecks.map((deck) => (
            <article className="saved-item" key={deck.id}>
              <div>
                <strong>{deck.topic}</strong>
                <p>{deck.cards?.length || 0} cards saved for revision</p>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={() => updateSavedFlashcardFlag(userId, deck.id, !deck.saved)}
              >
                {deck.saved ? "Unsave" : "Save"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
