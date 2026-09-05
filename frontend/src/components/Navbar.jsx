import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, BookOpen, GraduationCap } from 'lucide-react';

export default function Navbar({ onNavigateHome, activeSubject }) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Brand */}
          <div 
            onClick={onNavigateHome} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  StudyMate AI
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent Socratic Study Assistant</p>
            </div>
          </div>

          {/* Active Subject Breadcrumb (if any) */}
          {activeSubject && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">{activeSubject.name}</span>
            </div>
          )}

          {/* User profile & Logout */}
          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-9 h-9 rounded-full border border-slate-200 shadow-sm object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {currentUser.displayName || 'Student'}
                  </p>
                  <p className="text-xs text-slate-500 truncate max-w-[140px]">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
