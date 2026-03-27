const { HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const CLAUDE_MODEL = "claude-3-5-sonnet-latest";

function getClaudeErrorMessage(status, rawError) {
  if (status === 401) {
    return "Claude API key is invalid or missing permission.";
  }

  if (status === 403) {
    return "Claude API access was denied for this project.";
  }

  if (status === 429) {
    return "Claude API rate limit reached. Please try again shortly.";
  }

  if (status >= 500) {
    return "Claude API is temporarily unavailable.";
  }

  return rawError || "Claude request failed.";
}

async function callClaudeJson({ system, prompt, maxTokens = 1800, temperature = 0.4 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "ANTHROPIC_API_KEY is not configured in Firebase Functions."
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      system,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError = null;

    try {
      parsedError = JSON.parse(errorText);
    } catch {
      parsedError = null;
    }

    const providerMessage =
      parsedError?.error?.message || parsedError?.message || errorText;

    logger.error("Claude API error", {
      status: response.status,
      errorText
    });

    throw new HttpsError(
      response.status === 401 || response.status === 403
        ? "permission-denied"
        : response.status === 429
          ? "resource-exhausted"
          : "internal",
      getClaudeErrorMessage(response.status, providerMessage),
      {
        provider: "anthropic",
        status: response.status
      }
    );
  }

  const data = await response.json();
  const text = data.content?.find((item) => item.type === "text")?.text;

  if (!text) {
    throw new HttpsError("internal", "Claude returned an empty response.");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    logger.error("Claude JSON parse error", { text, error: error.message });
    throw new HttpsError(
      "internal",
      "Claude returned invalid JSON. Adjust the prompt or retry.",
      {
        provider: "anthropic"
      }
    );
  }
}

module.exports = {
  callClaudeJson
};
