const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Automatically utilizes Application Default Credentials (ADC) on Cloud Run / GCP,
// or GOOGLE_APPLICATION_CREDENTIALS in local environment.
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  
  if (projectId) {
    admin.initializeApp({
      projectId: projectId
    });
  } else {
    admin.initializeApp();
  }
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  admin,
  auth,
  db
};
