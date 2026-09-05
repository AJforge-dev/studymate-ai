const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verifyToken } = require('./middleware/auth');
const subjectsRouter = require('./routes/subjects');
const chatRouter = require('./routes/chat');
const quizRouter = require('./routes/quiz');
const { getGeminiApiKey } = require('./config/secrets');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for local development
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Public health-check probe for Cloud Run & monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'studymate-ai-backend', timestamp: new Date() });
});

// Protected API Routes - all require valid Firebase ID Bearer Token
app.use('/api/subjects', verifyToken, subjectsRouter);
app.use('/api/chat', verifyToken, chatRouter);
app.use('/api/quiz', verifyToken, quizRouter);

// Serve static frontend assets built by Vite (for single-container Cloud Run deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback for frontend client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      // In local backend dev without built frontend
      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>StudyMate AI Backend is Running 🚀</h2>
            <p>Port: ${PORT}</p>
            <p>API routes are mounted at <code>/api/*</code>.</p>
            <p>Frontend static files will be served here once <code>npm run build</code> is executed in /frontend.</p>
          </body>
        </html>
      `);
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

let server = null;

if (require.main === module) {
  server = app.listen(PORT, async () => {
    console.log(`===========================================`);
    console.log(` StudyMate AI Server listening on port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===========================================`);

    // Optionally pre-warm Gemini API secret key check
    try {
      await getGeminiApiKey();
      console.log('✓ Gemini API Key successfully initialized.');
    } catch (err) {
      console.warn('ℹ Gemini API Key will be resolved dynamically on first request:', err.message);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
}

module.exports = app;
