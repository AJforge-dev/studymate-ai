const { getGeminiClient, getModelName } = require('../config/gemini');

/**
 * Cleans code fences (e.g. ```json ... ```) and extracts JSON payload
 */
function cleanAndParseJson(text) {
  if (!text) {
    throw new Error('Empty response received from Gemini.');
  }

  let cleaned = text.trim();

  // Strip leading code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  // Strip trailing code fences
  cleaned = cleaned.replace(/\s*```$/i, '').trim();

  // Attempt direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // If wrapped in narrative text, extract array or object bracket range
    const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (e) {
        // continue
      }
    }

    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch (e) {
        // continue
      }
    }

    throw new Error(`Failed to parse valid JSON from AI response: ${initialErr.message}`);
  }
}

/**
 * Generates an AI tutor response for a subject based on conversation history.
 * 
 * @param {string} subjectName - Name of the subject (e.g., "Physics")
 * @param {Array<{role: string, text: string}>} conversationHistory - Prior messages
 * @param {string} newMessage - New user question/input
 * @returns {Promise<string>} - Tutor AI response
 */
async function generateTutorResponse(subjectName, conversationHistory = [], newMessage) {
  const ai = await getGeminiClient();
  const model = getModelName();

  const systemInstruction = 
    `You are a patient, encouraging tutor for ${subjectName}. Explain concepts simply with examples. Ask a follow-up question to check understanding after each explanation.`;

  // Build Gemini contents array from stored history + new message
  // Filter and format each entry to { role: 'user' | 'model', parts: [{ text }] }
  const contents = [];

  for (const msg of conversationHistory) {
    if (!msg.text || !msg.text.trim()) continue;
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text.trim() }]
    });
  }

  // Append new user message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage.trim() }]
  });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  const replyText = response.text?.trim() || '';
  if (!replyText) {
    throw new Error('Gemini returned an empty response.');
  }

  return replyText;
}

/**
 * Generates a 5-question multiple-choice quiz based on the conversation history.
 * 
 * @param {string} subjectName - Name of the subject
 * @param {Array<{role: string, text: string}>} conversationHistory - Full conversation context
 * @returns {Promise<Array<{question: string, options: string[], correctAnswerIndex: number}>>}
 */
async function generateQuizFromHistory(subjectName, conversationHistory = []) {
  const ai = await getGeminiClient();
  const model = getModelName();

  if (!conversationHistory || conversationHistory.length === 0) {
    throw new Error('Cannot generate quiz without conversation history.');
  }

  // Format conversation context as readable text
  const contextSummary = conversationHistory
    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
    .join('\n\n');

  const prompt = `Based on the following study conversation for the subject "${subjectName}", create a 5-question multiple-choice quiz to test the student's comprehension.

Conversation:
${contextSummary}

Requirements:
- Return ONLY a valid JSON array of exactly 5 questions.
- Do NOT include any markdown formatting, preamble, explanation, or code fences. Return raw JSON.
- Each question must follow this exact schema:
[
  {
    "question": "Clear question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0
  }
]
- "options" must have exactly 4 strings.
- "correctAnswerIndex" must be an integer between 0 and 3 corresponding to the correct option.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  const rawText = response.text || '';
  const parsed = cleanAndParseJson(rawText);

  // Validate quiz structure
  let questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.quiz;
  if (!Array.isArray(questions)) {
    throw new Error('AI output did not contain an array of questions.');
  }

  // Sanitize questions
  questions = questions.slice(0, 5).map((q, idx) => {
    const questionText = q.question || `Question ${idx + 1}`;
    let options = Array.isArray(q.options) ? q.options.map(String) : [];
    while (options.length < 4) {
      options.push(`Choice ${options.length + 1}`);
    }
    options = options.slice(0, 4);
    let correctIdx = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0;
    if (correctIdx < 0 || correctIdx > 3) {
      correctIdx = 0;
    }

    return {
      question: questionText,
      options,
      correctAnswerIndex: correctIdx
    };
  });

  return questions;
}

module.exports = {
  generateTutorResponse,
  generateQuizFromHistory
};
