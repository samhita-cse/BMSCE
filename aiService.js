import { analyzeWeakAreas, generateStudyContent } from "./firestoreService";
import {
  getDemoFlashcards,
  getDemoQuiz,
  getDemoTopicExplanation,
  getDemoWeakAreaAnalysis
} from "./demoAiService";

const forceDemoMode = import.meta.env.VITE_DEMO_AI !== "false";

function normalizeFunctionError(error, fallbackMessage) {
  const message =
    error?.details?.message ||
    error?.details ||
    error?.message ||
    fallbackMessage;

  if (message === "internal" || message === "INTERNAL") {
    return "The AI backend failed. Make sure Firebase Functions are deployed and the Claude API key is valid.";
  }

  if (error?.code === "functions/not-found") {
    return "Firebase Functions are not deployed or the function name/region does not match.";
  }

  if (error?.code === "functions/unavailable") {
    return "Firebase Functions are unavailable right now. Check your network or deployed backend.";
  }

  return message;
}

export async function getTopicExplanation(topic) {
  if (forceDemoMode) {
    return getDemoTopicExplanation(topic);
  }

  try {
    const response = await generateStudyContent({
      topic,
      mode: "explanation"
    });
    return response.data;
  } catch (error) {
    console.warn("Falling back to demo explanation mode:", error);
    return getDemoTopicExplanation(topic);
  }
}

export async function getQuiz(topic, questionCount = 10) {
  if (forceDemoMode) {
    return getDemoQuiz(topic, questionCount);
  }

  try {
    const response = await generateStudyContent({
      topic,
      mode: "quiz",
      questionCount
    });
    return response.data;
  } catch (error) {
    console.warn("Falling back to demo quiz mode:", error);
    return getDemoQuiz(topic, questionCount);
  }
}

export async function getFlashcards(topic) {
  if (forceDemoMode) {
    return getDemoFlashcards(topic);
  }

  try {
    const response = await generateStudyContent({
      topic,
      mode: "flashcards"
    });
    return response.data;
  } catch (error) {
    console.warn("Falling back to demo flashcard mode:", error);
    return getDemoFlashcards(topic);
  }
}

export async function getWeakAreaAnalysis(topic, attempts) {
  if (forceDemoMode) {
    return getDemoWeakAreaAnalysis(topic, attempts);
  }

  try {
    const response = await analyzeWeakAreas({
      topic,
      attempts
    });
    return response.data;
  } catch (error) {
    console.warn("Falling back to demo weak-area mode:", error);
    return getDemoWeakAreaAnalysis(topic, attempts);
  }
}
