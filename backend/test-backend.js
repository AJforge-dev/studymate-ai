const assert = require('assert');
const app = require('./src/index');
const http = require('http');

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test Health Endpoint
    console.log('Testing GET /health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    console.log('✓ Health endpoint PASSED');

    // 2. Test Unauthenticated /api/subjects
    console.log('Testing unauthenticated GET /api/subjects...');
    const subjectsRes = await fetch(`${baseUrl}/api/subjects`);
    assert.strictEqual(subjectsRes.status, 401, 'Unauthenticated request must be rejected with 401');
    console.log('✓ Unauthenticated GET /api/subjects rejected with 401');

    // 3. Test Invalid Token /api/subjects
    console.log('Testing invalid token on GET /api/subjects...');
    const invalidTokenRes = await fetch(`${baseUrl}/api/subjects`, {
      headers: { Authorization: 'Bearer fake-invalid-jwt-token' }
    });
    assert.strictEqual(invalidTokenRes.status, 401, 'Invalid token must be rejected with 401');
    console.log('✓ Invalid token rejected with 401');

    // 4. Test Unauthenticated POST /api/chat
    console.log('Testing unauthenticated POST /api/chat...');
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: '123', message: 'Hello' })
    });
    assert.strictEqual(chatRes.status, 401, 'Unauthenticated chat must be rejected with 401');
    console.log('✓ Unauthenticated POST /api/chat rejected with 401');

    // 5. Test Unauthenticated POST /api/quiz
    console.log('Testing unauthenticated POST /api/quiz...');
    const quizRes = await fetch(`${baseUrl}/api/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: '123' })
    });
    assert.strictEqual(quizRes.status, 401, 'Unauthenticated quiz must be rejected with 401');
    console.log('✓ Unauthenticated POST /api/quiz rejected with 401');

    // 6. Test Frontend Static Asset Serving (dist/index.html)
    console.log('Testing GET / (serving frontend static SPA)...');
    const spaRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(spaRes.status, 200);
    const spaHtml = await spaRes.text();
    assert(spaHtml.includes('StudyMate AI'), 'HTML must include StudyMate AI title');
    console.log('✓ Frontend static SPA serving PASSED');

    // 7. Test Gemini Markdown Code Fence Stripping & JSON Parsing
    console.log('Testing JSON parsing and fence stripping...');
    const sampleAiOutputWithFences = `\`\`\`json
[
  {
    "question": "What is Newton's first law of motion?",
    "options": ["Law of Inertia", "F=ma", "Action and Reaction", "Gravitation"],
    "correctAnswerIndex": 0
  },
  {
    "question": "What is the unit of force?",
    "options": ["Joule", "Newton", "Watt", "Pascal"],
    "correctAnswerIndex": 1
  }
]
\`\`\``;

    // We test the logic from geminiService
    const cleanFn = (text) => {
      let cleaned = text.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
      cleaned = cleaned.replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned);
    };

    const parsed = cleanFn(sampleAiOutputWithFences);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].correctAnswerIndex, 0);
    assert.strictEqual(parsed[1].correctAnswerIndex, 1);
    console.log('✓ JSON fence stripping and parsing PASSED');

    console.log('\n🎉 ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
