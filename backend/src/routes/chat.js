const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');
const geminiService = require('../services/geminiService');

/**
 * GET /api/chat/:subjectId
 * Retrieves all previous messages for this user and subject
 */
router.get('/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await firestoreService.getSubject(req.uid, subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const messages = await firestoreService.getMessages(req.uid, subjectId);
    res.json({
      subject,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history.' });
  }
});

/**
 * POST /api/chat
 * Handles multi-turn tutoring interaction:
 * 1. Verifies token & extracts uid (via auth middleware)
 * 2. Fetches prior conversation history for uid+subjectId
 * 3. Calls Gemini with patient/encouraging system instruction
 * 4. Passes full prior conversation + new message
 * 5. Saves both user message & model response to Firestore
 * 6. Returns AI response to frontend
 */
router.post('/', async (req, res) => {
  try {
    const { subjectId, message } = req.body;

    if (!subjectId || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'subjectId and message are required.' });
    }

    // 1. Verify subject exists and get its name
    const subject = await firestoreService.getSubject(req.uid, subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    // 2. Fetch prior conversation history
    const priorHistory = await firestoreService.getMessages(req.uid, subjectId);

    // 3. Call Gemini API with tutoring instruction & multi-turn history
    const trimmedMessage = message.trim();
    const aiResponseText = await geminiService.generateTutorResponse(
      subject.name,
      priorHistory,
      trimmedMessage
    );

    // 4. Save user message to Firestore
    const userMessageDoc = await firestoreService.addMessage(
      req.uid,
      subjectId,
      'user',
      trimmedMessage
    );

    // 5. Save AI response to Firestore
    const aiMessageDoc = await firestoreService.addMessage(
      req.uid,
      subjectId,
      'model',
      aiResponseText
    );

    // 6. Return response to frontend
    res.json({
      response: aiResponseText,
      userMessage: userMessageDoc,
      aiMessage: aiMessageDoc
    });
  } catch (error) {
    console.error('Error handling chat turn:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while communicating with AI tutor.'
    });
  }
});

module.exports = router;
