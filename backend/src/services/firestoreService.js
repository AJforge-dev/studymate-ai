const { admin, db } = require('../config/firebase');

/**
 * Helper to convert Firestore Timestamp or FieldValue to ISO string
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Retrieves all subjects belonging to a user
 */
async function getSubjects(uid) {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: formatTimestamp(doc.data().createdAt)
  }));
}

/**
 * Retrieves a single subject document by ID
 */
async function getSubject(uid, subjectId) {
  const doc = await db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
    createdAt: formatTimestamp(doc.data().createdAt)
  };
}

/**
 * Creates a new subject for a user
 */
async function createSubject(uid, name) {
  const subjectRef = db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc();

  const now = admin.firestore.FieldValue.serverTimestamp();
  const data = {
    name: name.trim(),
    createdAt: now
  };

  await subjectRef.set(data);

  return {
    id: subjectRef.id,
    name: name.trim(),
    createdAt: new Date().toISOString()
  };
}

/**
 * Deletes a subject and its nested conversations/quizzes
 */
async function deleteSubject(uid, subjectId) {
  const subjectRef = db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId);

  await subjectRef.delete();
  return { success: true };
}

/**
 * Retrieves all conversation messages for a subject, in chronological order
 */
async function getMessages(uid, subjectId) {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId)
    .collection('conversations')
    .orderBy('timestamp', 'asc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role,
      text: data.text,
      timestamp: formatTimestamp(data.timestamp)
    };
  });
}

/**
 * Adds a message to a subject's conversation history
 */
async function addMessage(uid, subjectId, role, text) {
  const msgRef = db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId)
    .collection('conversations')
    .doc();

  const now = admin.firestore.FieldValue.serverTimestamp();
  const data = {
    role, // 'user' | 'model'
    text,
    timestamp: now
  };

  await msgRef.set(data);

  return {
    id: msgRef.id,
    role,
    text,
    timestamp: new Date().toISOString()
  };
}

/**
 * Saves a generated quiz under the subject
 */
async function saveQuiz(uid, subjectId, questions) {
  const quizRef = db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId)
    .collection('quizzes')
    .doc();

  const now = admin.firestore.FieldValue.serverTimestamp();
  const data = {
    questions,
    createdAt: now
  };

  await quizRef.set(data);

  return {
    id: quizRef.id,
    questions,
    createdAt: new Date().toISOString()
  };
}

/**
 * Retrieves all quizzes generated under a subject
 */
async function getQuizzes(uid, subjectId) {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('subjects')
    .doc(subjectId)
    .collection('quizzes')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      questions: data.questions,
      createdAt: formatTimestamp(data.createdAt)
    };
  });
}

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  deleteSubject,
  getMessages,
  addMessage,
  saveQuiz,
  getQuizzes
};
