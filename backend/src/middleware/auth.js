const { admin } = require('../config/firebase');

/**
 * Authentication middleware that verifies Firebase ID tokens.
 * Expected format: 'Authorization: Bearer <firebase_id_token>'
 * Populates req.uid and req.user on success; rejects with 401 on failure.
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Token verification error:', e.message);
    res.status(401).send('Invalid token');
  }
}

module.exports = {
  verifyToken
};
