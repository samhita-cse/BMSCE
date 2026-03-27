import { useState } from "react";
import { Panel } from "../components/Panel";
import { StatusMessage } from "../components/StatusMessage";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { useNotes } from "../hooks/useNotes";
import { extractTextFromFile } from "../services/fileTextService";
import {
  getDemoAnswerFromNotes,
  getDemoNoteExplanation,
  getDemoNoteFlashcards,
  getDemoNoteQuiz
} from "../services/demoAiService";
import {
  saveGeneratedFlashcards,
  saveQuizAttempt
} from "../services/firestoreService";
import { saveStudentNote } from "../services/notesService";

export function NotesWorkspace({ userId }) {
  const notes = useNotes(userId);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedAction, setSelectedAction] = useState("explanation");
  const [askQuestion, setAskQuestion] = useState("");
  const [output, setOutput] = useState(null);
  const saveTask = useAsyncTask(saveStudentNote);

  const selectedNote =
    notes.find((item) => item.id === selectedNoteId) || notes[0] || null;

  const handleSaveManualNote = async () => {
    if (!manualTitle.trim() || !manualText.trim()) {
      return;
    }

    await saveTask.run(userId, {
      title: manualTitle,
      text: manualText,
      sourceType: "manual"
    });

    setManualTitle("");
    setManualText("");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await extractTextFromFile(file);
      await saveTask.run(userId, {
        title: file.name.replace(/\.[^.]+$/, ""),
        text,
        fileName: file.name,
        sourceType: "file"
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!selectedNote) {
      return;
    }

    if (selectedAction === "explanation") {
      setOutput({
        type: "explanation",
        data: getDemoNoteExplanation({
          noteTitle: selectedNote.title,
          noteText: selectedNote.text
        })
      });
      return;
    }

    if (selectedAction === "quiz") {
      const data = getDemoNoteQuiz({
        noteTitle: selectedNote.title,
        noteText: selectedNote.text,
        questionCount
      });
      setOutput({ type: "quiz", data });
      await saveQuizAttempt(userId, {
        topic: `${selectedNote.title} (notes quiz)`,
        score: 0,
        total: data.questions.length,
        results: []
      });
      return;
    }

    if (selectedAction === "flashcards") {
      const data = getDemoNoteFlashcards({
        noteTitle: selectedNote.title,
        noteText: selectedNote.text
      });
      setOutput({ type: "flashcards", data });
      await saveGeneratedFlashcards(userId, selectedNote.title, data.flashcards);
      return;
    }

    if (selectedAction === "ask") {
      setOutput({
        type: "ask",
        data: getDemoAnswerFromNotes({
          noteTitle: selectedNote.title,
          noteText: selectedNote.text,
          question: askQuestion
        })
      });
    }
  };

  return (
    <Panel
      title="Notes Study Workspace"
      subtitle="Upload or paste notes, then generate free explanations, quizzes, flashcards, and Q&A."
      actions={
        <button className="primary-button" onClick={handleGenerate} type="button">
          Generate from notes
        </button>
      }
    >
      <div className="stack">
        <label className="field-label">
          Upload note file
          <input
            className="text-input"
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileUpload}
          />
        </label>
        <p className="muted">
          Best free support: pasted text, `.txt`, `.md`, `.docx`, and basic `.pdf`.
          Older Word and PowerPoint formats can be uploaded, but you may need to export
          them to `.docx` or `.pdf` for reliable extraction.
        </p>

        <label className="field-label">
          Note title
          <input
            className="text-input"
            value={manualTitle}
            onChange={(event) => setManualTitle(event.target.value)}
            placeholder="Chapter 3 Notes"
          />
        </label>

        <label className="field-label">
          Paste note text
          <textarea
            className="text-input notes-textarea"
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            placeholder="Paste your study notes here..."
          />
        </label>

        <button className="ghost-button" onClick={handleSaveManualNote} type="button">
          Save pasted notes
        </button>

        <StatusMessage
          error={saveTask.error}
          loadingLabel={saveTask.loading ? "Saving notes..." : ""}
        />

        <label className="field-label">
          Choose saved note
          <select
            className="text-input"
            value={selectedNoteId}
            onChange={(event) => setSelectedNoteId(event.target.value)}
          >
            <option value="">Latest note</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          Action
          <select
            className="text-input"
            value={selectedAction}
            onChange={(event) => setSelectedAction(event.target.value)}
          >
            <option value="explanation">Explain notes</option>
            <option value="quiz">Generate quiz</option>
            <option value="flashcards">Generate flashcards</option>
            <option value="ask">Ask a question from notes</option>
          </select>
        </label>

        {selectedAction === "quiz" ? (
          <label className="field-label">
            Number of quiz questions
            <select
              className="text-input"
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
            >
              {[10, 20, 30, 40, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedAction === "ask" ? (
          <label className="field-label">
            Ask from notes
            <input
              className="text-input"
              value={askQuestion}
              onChange={(event) => setAskQuestion(event.target.value)}
              placeholder="Ask something from the uploaded notes"
            />
          </label>
        ) : null}

        {output?.type === "explanation" ? (
          <div className="explanation-grid">
            {["simple", "medium", "advanced"].map((level) => (
              <article className="explanation-card" key={level}>
                <h3>{level}</h3>
                <p>{output.data.explanations[level]}</p>
              </article>
            ))}
          </div>
        ) : null}

        {output?.type === "quiz" ? (
          <div className="quiz-list">
            {output.data.questions.map((question, index) => (
              <article className="quiz-card" key={`${question.prompt}-${index}`}>
                <h3>
                  {index + 1}. {question.prompt}
                </h3>
                <p>Correct answer: {question.correctAnswer}</p>
                <p>{question.explanation}</p>
              </article>
            ))}
          </div>
        ) : null}

        {output?.type === "flashcards" ? (
          <div className="saved-list">
            {output.data.flashcards.map((card, index) => (
              <article className="saved-item" key={`${card.front}-${index}`}>
                <div>
                  <strong>{card.front}</strong>
                  <p>{card.back}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {output?.type === "ask" ? (
          <article className="quiz-summary">
            <h3>Answer from notes</h3>
            <p>{output.data.answer}</p>
            <p>Confidence: {output.data.confidence}</p>
            <div className="summary-list">
              {output.data.supportingPoints?.map((point, index) => (
                <div className="summary-item" key={`${point}-${index}`}>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </Panel>
  );
}
