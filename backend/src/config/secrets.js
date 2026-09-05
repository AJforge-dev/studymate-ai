const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

let cachedGeminiApiKey = null;

/**
 * Retrieves the Gemini API key either from environment variables or dynamically
 * from Google Cloud Secret Manager using the @google-cloud/secret-manager SDK.
 * Caches the secret in memory to eliminate subsequent network latency.
 */
async function getGeminiApiKey() {
  // 1. Return from in-memory cache if already retrieved
  if (cachedGeminiApiKey) {
    return cachedGeminiApiKey;
  }

  // 2. Check if already mounted into environment (e.g. via Cloud Run --set-secrets or local .env)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    cachedGeminiApiKey = process.env.GEMINI_API_KEY.trim();
    console.log('✓ Gemini API key loaded from environment variable.');
    return cachedGeminiApiKey;
  }

  // 3. Dynamically fetch from Google Cloud Secret Manager
  const secretName = process.env.SECRET_NAME || 'gemini-api-key';
  const secretVersion = process.env.SECRET_VERSION || 'latest';
  
  console.log(`Fetching secret '${secretName}' from Google Cloud Secret Manager...`);
  
  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GCP_PROJECT || 
                      process.env.GOOGLE_CLOUD_PROJECT || 
                      process.env.FIREBASE_PROJECT_ID || 
                      await client.getProjectId();

    if (!projectId) {
      throw new Error('Project ID could not be determined. Please set GCP_PROJECT or FIREBASE_PROJECT_ID.');
    }

    const name = `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`;
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString('utf8')?.trim();

    if (!payload) {
      throw new Error(`Secret '${name}' was retrieved but the payload was empty.`);
    }

    cachedGeminiApiKey = payload;
    console.log(`✓ Secret '${secretName}' successfully loaded from Secret Manager and cached.`);
    return cachedGeminiApiKey;
  } catch (error) {
    console.error(`Failed to fetch '${secretName}' from Secret Manager:`, error.message);
    throw new Error(
      `Unable to resolve Gemini API key. Ensure GEMINI_API_KEY is set in your environment, ` +
      `or that secret '${secretName}' exists in GCP Secret Manager and your identity has Secret Manager Secret Accessor permissions. Details: ${error.message}`
    );
  }
}

module.exports = {
  getGeminiApiKey
};
