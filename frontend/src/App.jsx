import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import LoadingSpinner from './components/LoadingSpinner';

function MainLayout() {
  const { currentUser, loading } = useAuth();
  const [activeSubject, setActiveSubject] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="large" text="Starting StudyMate AI..." />
      </div>
    );
  }

  // Unauthenticated users see the landing page
  if (!currentUser) {
    return <LandingPage />;
  }

  // Authenticated users
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar 
        activeSubject={activeSubject}
        onNavigateHome={() => setActiveSubject(null)}
      />

      <main className="flex-1">
        {activeSubject ? (
          <ChatInterface 
            subject={activeSubject}
            onBack={() => setActiveSubject(null)}
          />
        ) : (
          <Dashboard 
            onSelectSubject={(subject) => setActiveSubject(subject)}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
