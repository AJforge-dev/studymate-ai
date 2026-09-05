const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// Automatically utilizes:
// 1. serviceAccountKey.json if present in backend or root (ideal for local dev)
// 2. GOOGLE_APPLICATION_CREDENTIALS environment variable
// 3. Application Default Credentials (ADC) on Cloud Run / GCP with projectId
if (!admin.apps.length) {
  const possibleKeyPaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.resolve(__dirname, '../../serviceAccountKey.json'),
    path.resolve(__dirname, '../serviceAccountKey.json'),
    path.resolve(__dirname, './serviceAccountKey.json')
  ].filter(Boolean);

  let initialized = false;
  for (const keyPath of possibleKeyPaths) {
    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = require(keyPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
        });
        console.log(`✓ Firebase Admin initialized with service account key: ${keyPath}`);
        initialized = true;
        break;
      } catch (err) {
        console.warn(`Could not load service account key at ${keyPath}:`, err.message);
      }
    }
  }

  if (!initialized) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    if (projectId) {
      admin.initializeApp({
        projectId: projectId
      });
      console.log(`✓ Firebase Admin initialized with projectId: ${projectId}`);
    } else {
      admin.initializeApp();
      console.log(`✓ Firebase Admin initialized with default credentials.`);
    }
  }
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  admin,
  auth,
  db
};
