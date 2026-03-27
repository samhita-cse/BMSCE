import { useState } from "react";
import { Panel } from "../components/Panel";
import { StatusMessage } from "../components/StatusMessage";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getQuiz, getWeakAreaAnalysis } from "../services/aiService";
import {
  saveQuizAttempt,
  updateWeakAreas
} from "../services/firestoreService";

export function QuizGenerator({ userId, recentQuizzes }) {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [quizSummary, setQuizSummary] = useState(null);
  const quizTask = useAsyncTask(getQuiz);
  const weakAreaTask = useAsyncTask(getWeakAreaAnalysis);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    setSubmitted(false);
    setSelectedAnswers({});
    setQuizSummary(null);

    try {
      const response = await quizTask.run(topic, questionCount);
      setQuiz(response.questions || []);
    } catch {
      setQuiz([]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleGenerate();
    }
  };

  const handleSubmit = async () => {
    const results = quiz.map((question, index) => {
      const selected = selectedAnswers[index];
      const correct = selected === question.correctAnswer;

      return {
        prompt: question.prompt,
        selected,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        correct,
        concept: question.concept || topic
      };
    });

    const score = results.filter((item) => item.correct).length;
    const incorrect = results.filter((item) => !item.correct);
    setSubmitted(true);
    setQuizSummary({
      score,
      total: quiz.length,
      correctCount: score,
      wrongCount: incorrect.length,
      incorrect
    });

    await saveQuizAttempt(userId, {
      topic,
      score,
      total: quiz.length,
      results
    });

    try {
      const weakAreaResponse = await weakAreaTask.run(topic, [
        ...recentQuizzes,
        { topic, score, total: quiz.length, results }
      ]);
      await updateWeakAreas(userId, weakAreaResponse.weakAreas || []);
    } catch {
      return;
    }
  };

  return (
    <Panel
      title="MCQ Quiz Generator"
      subtitle="Generate quizzes, review explanations, and surface weak areas."
      actions={
        <button className="primary-button" onClick={handleGenerate} type="button">
          {quizTask.loading ? "Generating..." : "Create quiz"}
        </button>
      }
    >
      <div className="stack">
        <input
          className="text-input"
          placeholder="Topic for quiz generation"
          value={topic}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            quizTask.clearError();
            weakAreaTask.clearError();
            setTopic(event.target.value);
          }}
        />
        <label className="field-label">
          Number of questions
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
        <StatusMessage
          error={quizTask.error || weakAreaTask.error}
          loadingLabel={
            quizTask.loading
              ? "Generating quiz with Claude..."
              : weakAreaTask.loading
                ? "Analyzing weak areas..."
                : ""
          }
        />

        <div className="quiz-list">
          {quiz.length === 0 ? (
            <p className="muted">No quiz loaded yet.</p>
          ) : (
            quiz.map((question, index) => (
              <article className="quiz-card" key={`${question.prompt}-${index}`}>
                <h3>
                  {index + 1}. {question.prompt}
                </h3>
                <div className="option-grid">
                  {question.options.map((option) => (
                    <label className="option-card" key={option}>
                      <input
                        checked={selectedAnswers[index] === option}
                        name={`question-${index}`}
                        type="radio"
                        onChange={() =>
                          setSelectedAnswers((current) => ({
                            ...current,
                            [index]: option
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {submitted ? (
                  <div className="answer-review">
                    <strong>Correct answer: {question.correctAnswer}</strong>
                    <p>{question.explanation}</p>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        {quizSummary ? (
          <article className="quiz-summary">
            <h3>Quiz Summary</h3>
            <p>
              Overall score: {quizSummary.score}/{quizSummary.total}
            </p>
            <p>Correct answers: {quizSummary.correctCount}</p>
            <p>Wrong answers: {quizSummary.wrongCount}</p>
            <div className="summary-list">
              {quizSummary.incorrect.length === 0 ? (
                <p className="muted">No wrong answers. Great job.</p>
              ) : (
                quizSummary.incorrect.map((item, index) => (
                  <div className="summary-item" key={`${item.prompt}-${index}`}>
                    <strong>{item.prompt}</strong>
                    <p>Your answer: {item.selected || "No answer selected"}</p>
                    <p>Correct answer: {item.correctAnswer}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        ) : null}

        {quiz.length > 0 ? (
          <button
            className="primary-button"
            disabled={weakAreaTask.loading}
            onClick={handleSubmit}
            type="button"
          >
            Submit quiz
          </button>
        ) : null}
      </div>
    </Panel>
  );
}
