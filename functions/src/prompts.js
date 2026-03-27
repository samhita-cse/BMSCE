const STUDY_SYSTEM_PROMPT = `
You are an expert academic study assistant.
Always return strictly valid JSON.
Never wrap JSON in markdown fences.
Never include commentary outside the JSON object.
Keep outputs accurate, student-friendly, and well-structured.
`.trim();

function buildExplanationPrompt(topic) {
  return `
Generate topic explanations for "${topic}" in three levels.

Return exactly this JSON shape:
{
  "topic": "${topic}",
  "explanations": {
    "simple": "Explain like the student is 10 years old. Use intuitive examples.",
    "medium": "Explain for a typical high-school or early college learner.",
    "advanced": "Explain in a detailed technical way with proper terminology."
  }
}

Requirements:
- Keep each level distinct in depth and vocabulary.
- Keep the explanations factually aligned with each other.
- Do not add any keys beyond the schema.
  `.trim();
}

function buildQuizPrompt(topic) {
  return `
Generate a multiple-choice quiz for "${topic}".

Return exactly this JSON shape:
{
  "topic": "${topic}",
  "questions": [
    {
      "prompt": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "One exact option string",
      "explanation": "Why the answer is correct",
      "concept": "The subtopic or concept being tested"
    }
  ]
}

Requirements:
- Generate exactly 5 questions.
- Each question must have exactly 4 plausible options.
- The correctAnswer must match one option exactly.
- Cover a mix of core concepts, not five versions of the same fact.
- Do not add any keys beyond the schema.
  `.trim();
}

function buildFlashcardsPrompt(topic) {
  return `
Generate revision flashcards for "${topic}".

Return exactly this JSON shape:
{
  "topic": "${topic}",
  "flashcards": [
    {
      "front": "Question or cue",
      "back": "Answer or explanation"
    }
  ]
}

Requirements:
- Generate exactly 6 flashcards.
- Keep the front concise and the back clear.
- Cover definitions, key ideas, and memory anchors.
- Do not add any keys beyond the schema.
  `.trim();
}

function buildWeakAreaPrompt(topic, attempts) {
  return `
Analyze the quiz attempts for "${topic}" and identify weak areas.

Return exactly this JSON shape:
{
  "weakAreas": [
    {
      "topic": "Weak subtopic",
      "reason": "What the student appears to be struggling with",
      "suggestion": "A concrete way to improve"
    }
  ]
}

Requirements:
- Focus on recurring mistakes and conceptual gaps.
- Keep each suggestion actionable for a student.
- Return an empty array if there is not enough evidence.

Quiz attempts:
${JSON.stringify(attempts)}
  `.trim();
}

module.exports = {
  STUDY_SYSTEM_PROMPT,
  buildExplanationPrompt,
  buildQuizPrompt,
  buildFlashcardsPrompt,
  buildWeakAreaPrompt
};
