const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');

/**
 * GET /api/subjects
 * Returns all subjects for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const subjects = await firestoreService.getSubjects(req.uid);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

/**
 * POST /api/subjects
 * Creates a new subject for the authenticated user
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }

    const newSubject = await firestoreService.createSubject(req.uid, name.trim());
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject.' });
  }
});

/**
 * GET /api/subjects/:id
 * Retrieves details for a specific subject
 */
router.get('/:id', async (req, res) => {
  try {
    const subject = await firestoreService.getSubject(req.uid, req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject details.' });
  }
});

/**
 * DELETE /api/subjects/:id
 * Deletes a subject
 */
router.delete('/:id', async (req, res) => {
  try {
    await firestoreService.deleteSubject(req.uid, req.params.id);
    res.json({ message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

module.exports = router;
