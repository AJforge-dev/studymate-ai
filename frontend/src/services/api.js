import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to make authenticated requests with Firebase Bearer token
 */
async function authFetch(endpoint, options = {}) {
  if (!auth?.currentUser) {
    throw new Error('User is not authenticated');
  }

  // Retrieve fresh ID token from Firebase SDK
  const token = await auth.currentUser.getIdToken();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMsg = errorData.error;
      }
    } catch (e) {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Subjects
  getSubjects: () => authFetch('/subjects'),
  createSubject: (name) => authFetch('/subjects', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  deleteSubject: (subjectId) => authFetch(`/subjects/${subjectId}`, {
    method: 'DELETE'
  }),

  // Chat
  getChatHistory: (subjectId) => authFetch(`/chat/${subjectId}`),
  sendMessage: (subjectId, message) => authFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ subjectId, message })
  }),

  // Quiz
  generateQuiz: (subjectId) => authFetch('/api/quiz' ? '/quiz' : '/quiz', {
    method: 'POST',
    body: JSON.stringify({ subjectId })
  }),
  getQuizzes: (subjectId) => authFetch(`/quiz/${subjectId}`)
};
