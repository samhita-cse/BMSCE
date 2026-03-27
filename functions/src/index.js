const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const { callClaudeJson } = require("./claudeClient");
const {
  STUDY_SYSTEM_PROMPT,
  buildExplanationPrompt,
  buildQuizPrompt,
  buildFlashcardsPrompt,
  buildWeakAreaPrompt
} = require("./prompts");

dotenv.config();
admin.initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

function ensureAuthenticated(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
}

exports.generateStudyContent = onCall(async (request) => {
  ensureAuthenticated(request);

  const { topic, mode } = request.data || {};
  if (!topic || !mode) {
    throw new HttpsError("invalid-argument", "Topic and mode are required.");
  }

  const promptBuilders = {
    explanation: buildExplanationPrompt,
    quiz: buildQuizPrompt,
    flashcards: buildFlashcardsPrompt
  };

  const buildPrompt = promptBuilders[mode];
  if (!buildPrompt) {
    throw new HttpsError("invalid-argument", "Unsupported study content mode.");
  }

  return callClaudeJson({
    system: STUDY_SYSTEM_PROMPT,
    prompt: buildPrompt(topic)
  });
});

exports.analyzeWeakAreas = onCall(async (request) => {
  ensureAuthenticated(request);

  const { topic, attempts } = request.data || {};
  if (!topic || !Array.isArray(attempts)) {
    throw new HttpsError("invalid-argument", "Topic and attempts are required.");
  }

  return callClaudeJson({
    system: STUDY_SYSTEM_PROMPT,
    prompt: buildWeakAreaPrompt(topic, attempts),
    maxTokens: 1200
  });
});
