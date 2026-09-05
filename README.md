# StudyMate AI 🎓 — Production-Ready Full-Stack AI Study Assistant

> **StudyMate AI** — An authenticated AI tutoring app with multi-turn Gemini conversations, per-user Firestore storage, and secure secret management, deployed on Google Cloud Run. Built for the **#AccelerateAIwithCloudRun** Ideathon.

---

## 🏛 Architecture Overview

StudyMate AI combines client-side reactivity with secure serverless compute and Google Cloud ecosystem integrations:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|  React (Vite) + Tailwind CSS SPA                                                  |
|  - Google Sign-In via Firebase Auth Client SDK                                    |
|  - Injects Firebase ID Token as Bearer Token on all API requests                  |
|  - Subject Management Dashboard, Multi-Turn Socratic Chat & Interactive Quizzes   |
+------------------------------------------+----------------------------------------+
                                           |
                                           | HTTPS (Bearer ID Token)
                                           v
+-----------------------------------------------------------------------------------+
|                           GOOGLE CLOUD RUN CONTAINER                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Express Web Server (:8080)                                                  |  |
|  |                                                                             |  |
|  | 1. Static Asset Server:                                                     |  |
|  |    Serves compiled React frontend from /app/frontend/dist                   |  |
|  |                                                                             |  |
|  | 2. Auth Middleware (verifyToken):                                           |  |
|  |    Verifies Firebase Bearer ID Token using firebase-admin SDK               |  |
|  |    Extracts & binds req.uid; denies unauthenticated requests (401)          |  |
|  |                                                                             |  |
|  | 3. Secret Manager Integration:                                              |  |
|  |    Resolves GEMINI_API_KEY from environment or fetches dynamically via      |  |
|  |    @google-cloud/secret-manager and caches in memory                        |  |
|  |                                                                             |  |
|  | 4. API Controllers:                                                         |  |
|  |    - /api/subjects : Subject CRUD operations                                |  |
|  |    - /api/chat     : Multi-turn Socratic conversation history & Gemini AI   |  |
|  |    - /api/quiz     : Structured JSON quiz generation & parsing              |  |
|  +------------------------+------------------------------------+---------------+  |
+---------------------------|------------------------------------|------------------+
                            |                                    |
                            v                                    v
+---------------------------------------+    +--------------------------------------+
|       GOOGLE CLOUD FIRESTORE          |    |          GOOGLE GEMINI API           |
|  Native Mode Hierarchical Storage:    |    |  (gemini-2.5-flash / 1.5-flash)      |
|  users/{uid}/                         |    |                                      |
|    subjects/{subjectId}/              |    |  Multi-turn Socratic Tutoring:       |
|      conversations/{messageId}        |    |  - Socratic system instruction       |
|      quizzes/{quizId}                 |    |  - Prior chat history as contents    |
|                                       |    |                                      |
|  Secured with strict firestore.rules  |    |  Comprehension Quiz Generation:      |
|  (only request.auth.uid == uid)       |    |  - Strict JSON schema output         |
+---------------------------------------+    +--------------------------------------+
```

---

## 🔍 How the 4 Core Technologies are Used

| Technology | Role & Implementation in StudyMate AI |
| :--- | :--- |
| **Firebase Authentication** | **Identity & Access Management:** Manages user onboarding via the Google Sign-In popup provider on the frontend. Generates cryptographically signed JWT ID tokens that the frontend sends in the `Authorization: Bearer <token>` header. The backend verifies these tokens via `firebase-admin.auth().verifyIdToken()`, strictly preventing unauthenticated API access. |
| **Cloud Firestore (Native Mode)** | **Secure, Per-User Data Persistence:** Stores subjects, multi-turn conversation logs, and generated quizzes using a clean nested collection model (`users/{uid}/subjects/{subjectId}/...`). Secured by `firestore.rules`, ensuring learners can only access their own educational data. |
| **Google Gemini API** | **Intelligent Socratic Tutoring & Quiz Authoring:** Powered by Google's latest Gemini models via `@google/genai`. Provides multi-turn, contextual tutoring using custom Socratic system instructions. For quizzes, Gemini synthesizes the entire conversation into a structured, validated 5-question multiple-choice JSON test. |
| **Google Cloud Run** | **Serverless Container Hosting:** Hosts the unified Docker container running both the compiled React frontend and the Express API server. Scales automatically from zero to meet demand, integrates natively with Google Cloud Secret Manager, and uses Application Default Credentials (ADC) for zero-credential authentication. |

---

## 📁 Repository Structure

```
.
├── Dockerfile                  # Multi-stage production container build
├── .dockerignore               # Prevents local artifacts from polluting container
├── firestore.rules             # Strict Firestore security rules (per-user isolation)
├── README.md                   # Complete architectural and deployment documentation
├── backend/
│   ├── package.json            # Express, firebase-admin, @google/genai, secret-manager
│   ├── .env.example            # Environment variables template for backend
│   └── src/
│       ├── index.js            # Express server entry point, static asset serving & SPA router
│       ├── config/
│       │   ├── firebase.js     # Firebase Admin initialization with ADC
│       │   ├── gemini.js       # Google GenAI client factory and model configuration
│       │   └── secrets.js      # Secret Manager loader with in-memory caching
│       ├── middleware/
│       │   └── auth.js         # Firebase Bearer token verification middleware
│       ├── routes/
│       │   ├── subjects.js     # Subject CRUD routes (/api/subjects)
│       │   ├── chat.js         # Multi-turn chat routes (/api/chat)
│       │   └── quiz.js         # Quiz generation & retrieval routes (/api/quiz)
│       └── services/
│           ├── firestoreService.js # Firestore subcollection queries and writes
│           └── geminiService.js    # Gemini API prompt formatting & JSON parser
└── frontend/
    ├── package.json            # React 18, Vite, Tailwind CSS, Lucide icons, Canvas-Confetti
    ├── vite.config.js          # Vite config with API proxy for local development
    ├── tailwind.config.js      # Tailwind CSS styling setup
    ├── postcss.config.js       # PostCSS config
    ├── index.html              # HTML entrypoint
    ├── .env.example            # Firebase Web credentials template
    └── src/
        ├── main.jsx            # React root mount
        ├── App.jsx             # Main view router and auth gate
        ├── index.css           # Tailwind directives and custom scrollbar
        ├── firebase.js         # Firebase Client SDK setup (Google Auth)
        ├── context/
        │   └── AuthContext.jsx # Auth state provider (login, logout, ID token)
        ├── services/
        │   └── api.js          # Authenticated API client (attaches Bearer token)
        └── components/
            ├── Navbar.jsx          # Header with user avatar and sign-out
            ├── LandingPage.jsx     # Hero section with Google Sign-In
            ├── Dashboard.jsx       # Subject creation and card grid
            ├── ChatInterface.jsx   # Multi-turn Socratic tutor chat
            ├── QuizModal.jsx       # Interactive 5-question quiz with score card
            └── LoadingSpinner.jsx  # Animated loading indicator
```

---

## 🗄 Firestore Data Structure

All documents are scoped under the authenticated user's UID:

```
users/
  └── {uid}/
        └── subjects/
              └── {subjectId}/
                    ├── name: string (e.g. "Quantum Physics")
                    ├── createdAt: timestamp
                    │
                    ├── conversations/
                    │     └── {messageId}/
                    │           ├── role: "user" | "model"
                    │           ├── text: string
                    │           └── timestamp: timestamp
                    │
                    └── quizzes/
                          └── {quizId}/
                                ├── questions: array [
                                │     {
                                │       question: string,
                                │       options: [string, string, string, string],
                                │       correctAnswerIndex: number (0-3)
                                │     }
                                │   ]
                                └── createdAt: timestamp
```

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all access by default
    match /{document=**} {
      allow read, write: if false;
    }

    // A user can ONLY read or write documents under their own users/{uid} path
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 🔐 Google Cloud Secret Manager Integration

To maintain production security, the Gemini API key is **never** committed to version control or hardcoded in source code.

### 1. Create the Secret in Secret Manager
Obtain your Gemini API key from [Google AI Studio](https://aistudio.google.com/).

Save your key to a temporary file `key.txt` (do not commit this file):
```bash
echo -n "YOUR_GEMINI_API_KEY" > key.txt
```

Create the secret in your GCP project:
```bash
gcloud secrets create gemini-api-key \
  --data-file=key.txt \
  --replication-policy="automatic"

# Remove the temporary key file
rm key.txt
```

### 2. Grant Access to the Cloud Run Service Account
Allow the Cloud Run runtime service account to read the secret:
```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant Secret Manager Secret Accessor to the default Compute service account
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

The backend code gracefully supports both:
1. **Dynamic Secret Manager Retrieval:** Utilizing `@google-cloud/secret-manager` to fetch `projects/${PROJECT}/secrets/gemini-api-key/versions/latest` at startup and caching the key in memory.
2. **Environment Variable Injection:** Direct reading of `process.env.GEMINI_API_KEY` when mounted via Cloud Run's `--set-secrets` parameter or local `.env`.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher) & npm
- A Firebase project with **Google Sign-In** enabled
- A Cloud Firestore database created in **Native Mode**
- A Gemini API key from Google AI Studio

### Step 1: Clone and Configure Environment Files

1. **Backend Configuration:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env`:
   ```ini
   PORT=8080
   GCP_PROJECT=your-firebase-project-id
   FIREBASE_PROJECT_ID=your-firebase-project-id
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.5-flash
   ```

   *(Note: For local Firebase Admin authentication, run `gcloud auth application-default login` or specify `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`).*

2. **Frontend Configuration:**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   In the [Firebase Console](https://console.firebase.google.com/) -> **Project Settings** -> **General** -> **Your apps** -> **Web App**, copy your config values into `frontend/.env`:
   ```ini
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   ```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Run the Application Locally

In two separate terminal windows:

- **Terminal 1: Start Backend API**
  ```bash
  cd backend
  npm run dev
  # Server runs on http://localhost:8080
  ```

- **Terminal 2: Start Frontend Dev Server**
  ```bash
  cd frontend
  npm run dev
  # Vite server runs on http://localhost:3000 (proxies /api to :8080)
  ```

Open your browser to `http://localhost:3000`.

---

## 🚢 Google Cloud Run Deployment

StudyMate AI uses a multi-stage Docker build that compiles the React frontend and packages it with the Express backend into a single, highly efficient container.

### Step 1: Deploy Firestore Security Rules
```bash
# Using the Firebase CLI
npx firebase-tools deploy --only firestore:rules
```

### Step 2: Build and Deploy to Cloud Run

Deploy directly from source with a single command:

```bash
gcloud run deploy studymate-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars=NODE_ENV=production,FIREBASE_PROJECT_ID=$(gcloud config get-value project)
```

### Explanation of Deployment Flags:
- `--source .`: Triggers Google Cloud Build to execute the multi-stage `Dockerfile`.
- `--region us-central1`: Deploys to the US Central region.
- `--allow-unauthenticated`: Permits public HTTPS web access so users can view the landing page and authenticate.
- `--set-secrets=GEMINI_API_KEY=gemini-api-key:latest`: Securely mounts the Secret Manager secret directly into the container as an environment variable.
- `--set-env-vars`: Passes production flags and project configuration to the runtime container.

Once the deployment finishes, Cloud Run outputs your production URL:
```
Service [studymate-ai] revision [studymate-ai-00001] has been deployed and is serving 100 percent of traffic.
Service URL: https://studymate-ai-xxxxxxxxxx-uc.a.run.app
```

---

## 🧪 Verification & Features Testing

1. **Authentication Flow:**
   - Navigate to the app URL.
   - Click **Sign in with Google**.
   - Upon authentication, Firebase issues an ID token, and the app redirects to the **Subjects Dashboard**.
   - Try sending a manual HTTP request without the `Authorization` header to `/api/subjects`: verify it is rejected with `401 Unauthorized`.

2. **Subject Management:**
   - Enter a subject name (e.g., "Quantum Computing") in the Add Subject input.
   - Verify the subject card is rendered in the dashboard and stored in Firestore under `users/{uid}/subjects`.

3. **Multi-Turn AI Tutor Chat:**
   - Click on the subject to open the chat interface.
   - Send: *"Can you explain superposition in simple terms?"*
   - Verify that Gemini responds in a patient, Socratic manner and asks a follow-up question.
   - Send a reply answering the tutor's question.
   - Verify that the prior conversation context was retained and built upon.

4. **Quiz Generation:**
   - Click **Generate Quiz from this conversation**.
   - Verify the backend calls Gemini to generate a 5-question multiple choice quiz in JSON format, strips markdown fences, saves it under `quizzes/`, and returns it.
   - Select answers to questions 1 through 5 and click **Submit Quiz**.
   - Verify that the interactive score card calculates the score, provides visual feedback for correct/incorrect answers, and launches celebratory confetti.

---

## 🛡 Security & Compliance

- **No Hardcoded Credentials:** No keys are checked into source control.
- **Principle of Least Privilege:** Cloud Run identity uses IAM-scoped Secret Accessor permissions.
- **Isolated User Storage:** Strict Firestore rules guarantee that User A cannot read or modify User B's subjects, chats, or quizzes.
- **Graceful Error Handling:** Handlers strip internal stack traces from client responses.

---

## 📄 License
Distributed under the Apache 2.0 License. Built for educational excellence.
