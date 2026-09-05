import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Clock 
} from 'lucide-react';

export default function Dashboard({ onSelectSubject }) {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError(err.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;

    try {
      setCreating(true);
      setError(null);
      const created = await api.createSubject(trimmed);
      setSubjects(prev => [created, ...prev]);
      setNewSubjectName('');
    } catch (err) {
      console.error('Failed to create subject:', err);
      setError(err.message || 'Failed to create subject.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (e, subjectId) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm('Are you sure you want to delete this subject and its chat history?')) {
      return;
    }

    try {
      await api.deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
    } catch (err) {
      console.error('Failed to delete subject:', err);
      alert('Failed to delete subject: ' + err.message);
    }
  };

  const sampleSubjects = ['Physics', 'World History', 'Organic Chemistry', 'Calculus', 'Computer Architecture'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a subject to begin your Socratic tutoring session, or add a new one below.
          </p>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleCreateSubject} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Add new subject (e.g. Physics)..."
            disabled={creating}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition shadow-sm"
          />
          <button
            type="submit"
            disabled={creating || !newSubjectName.trim()}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {creating ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Subject</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={loadSubjects}
            className="text-xs font-semibold underline hover:text-red-900 ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Section */}
      <div className="mt-8">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="large" text="Loading your subjects from Firestore..." />
          </div>
        ) : subjects.length === 0 ? (
          
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No subjects yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Start your journey! Add your first subject using the input above or pick one of these popular subjects:
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {sampleSubjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setNewSubjectName(sub)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition"
                >
                  + {sub}
                </button>
              ))}
            </div>
          </div>

        ) : (

          /* Subject Cards Grid */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <span>Your Subjects</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {subjects.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top accent border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-sm">
                        {subject.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteSubject(e, subject.id)}
                        title="Delete subject"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </h3>

                    {subject.createdAt && (
                      <div className="mt-2 flex items-center text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Created {new Date(subject.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span className="flex items-center space-x-1 group-hover:underline">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      <span>Open AI Tutor</span>
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
