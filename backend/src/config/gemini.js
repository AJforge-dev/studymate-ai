const { GoogleGenAI } = require('@google/genai');
const { getGeminiApiKey } = require('./secrets');

let genAIClient = null;

/**
 * Returns an initialized GoogleGenAI instance using the secret API key.
 */
async function getGeminiClient() {
  const apiKey = await getGeminiApiKey();
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

/**
 * Default Gemini model identifier. Can be overridden via GEMINI_MODEL env variable.
 * Supports gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash.
 */
function getModelName() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

module.exports = {
  getGeminiClient,
  getModelName
};
