const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');
const geminiService = require('../services/geminiService');

/**
 * POST /api/quiz
 * Generates a 5-question multiple choice quiz from the conversation history
 * of a specific subject, parses JSON, and saves it to Firestore.
 */
router.post('/', async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required.' });
    }

    // 1. Verify subject
    const subject = await firestoreService.getSubject(req.uid, subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    // 2. Fetch conversation history
    const conversationHistory = await firestoreService.getMessages(req.uid, subjectId);
    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'No conversation history found for this subject. Chat with the tutor before generating a quiz!'
      });
    }

    // 3. Generate quiz questions using Gemini
    const questions = await geminiService.generateQuizFromHistory(
      subject.name,
      conversationHistory
    );

    // 4. Save quiz to Firestore under subjects/{subjectId}/quizzes/{quizId}
    const savedQuiz = await firestoreService.saveQuiz(req.uid, subjectId, questions);

    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz from conversation.'
    });
  }
});

/**
 * GET /api/quiz/:subjectId
 * Retrieves past quizzes generated under this subject
 */
router.get('/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const quizzes = await firestoreService.getQuizzes(req.uid, subjectId);
    res.json(quizzes);
  } catch (error) {
    console.error('Error retrieving quizzes:', error);
    res.status(500).json({ error: 'Failed to retrieve quizzes.' });
  }
});

module.exports = router;
