import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Cloud 
} from 'lucide-react';

export default function LandingPage() {
  const { signInWithGoogle, isFirebaseConfigured, authError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setLocalError(null);
      await signInWithGoogle();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-between">
      
      {/* Top Banner */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            StudyMate AI
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Google Cloud & Gemini Ready</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Next-Gen Multi-Turn AI Socratic Tutoring</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none max-w-4xl">
          Master any subject with your personal{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            AI Study Companion
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          StudyMate AI provides encouraging, step-by-step tutoring powered by Google Gemini.
          Organize your subjects, explore complex concepts, and test your retention with 
          instant 5-question quizzes generated straight from your conversations.
        </p>

        {/* Sign In CTA */}
        <div className="mt-10 flex flex-col items-center space-y-4">
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Google "G" logo SVG */}
            <svg className="w-5 h-5 mr-3 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.19 0 10.04 0 12s.45 3.81 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{signingIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
          </button>

          {(localError || authError) && (
            <div className="max-w-md p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {localError || authError}
            </div>
          )}

          {!isFirebaseConfigured && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg max-w-md">
              <strong>Notice:</strong> Firebase web credentials not yet set in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>. See README for setup instructions.
            </p>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Subject Dashboard</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Create and manage subjects like Physics, Literature, or Calculus. Each subject maintains its own persistent learning context.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Socratic Multi-Turn Chat</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Gemini acts as an encouraging, patient tutor. It explains concepts simply and asks follow-up questions to verify your understanding.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Instant AI Quizzes</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Click one button to generate a 5-question multiple choice quiz directly tailored to what you just learned. Get instant scored feedback.
            </p>
          </div>

        </div>

        {/* Architecture Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Firebase Auth & Rules</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
            <Database className="w-4 h-4 text-amber-600" />
            <span>Cloud Firestore Native</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Gemini Flash API</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
            <Cloud className="w-4 h-4 text-teal-600" />
            <span>Google Cloud Run & Secret Manager</span>
          </span>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500">
        StudyMate AI • Full-Stack Cloud Run + Firebase + Google Gemini Architecture
      </footer>

    </div>
  );
}
