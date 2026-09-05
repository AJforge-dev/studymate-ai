import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import QuizModal from './QuizModal';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  RefreshCw,
  Clock,
  BookOpen
} from 'lucide-react';

export default function ChatInterface({ subject, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    loadChatHistory();
  }, [subject.id]);

  useEffect(() => {
    if (!loadingHistory) {
      scrollToBottom('auto');
    }
  }, [messages, loadingHistory]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      const data = await api.getChatHistory(subject.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError(err.message || 'Failed to load conversation history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    // Optimistically show user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setSending(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await api.sendMessage(subject.id, text);
      // Append confirmed AI response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        response.userMessage || tempUserMsg,
        response.aiMessage || {
          id: 'ai-' + Date.now(),
          role: 'model',
          text: response.response,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Error communicating with AI tutor.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleGenerateQuiz = async () => {
    if (messages.length === 0 || generatingQuiz) return;

    try {
      setGeneratingQuiz(true);
      setError(null);
      const quiz = await api.generateQuiz(subject.id);
      setActiveQuiz(quiz);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError(err.message || 'Failed to generate quiz from conversation.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 sm:px-6 py-3.5 shadow-sm flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Back to subjects"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
              {subject.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {subject.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                Socratic AI Tutor Active
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Generation Action Button */}
        <button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz || messages.length === 0}
          title={messages.length === 0 ? 'Chat with the tutor first to generate a quiz' : 'Generate quiz from conversation'}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingQuiz ? (
            <>
              <LoadingSpinner size="small" />
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Generate Quiz from this conversation</span>
              <span className="sm:hidden">Quiz</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-xs font-semibold underline hover:text-red-900 ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 overflow-y-auto custom-scrollbar shadow-sm space-y-4">
        {loadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="large" text="Retrieving conversation history..." />
          </div>
        ) : messages.length === 0 ? (
          
          /* Empty Conversation Welcome State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Welcome to your {subject.name} session!
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              I am your patient Socratic tutor. Ask me to explain a concept, break down a problem, or test your comprehension with examples!
            </p>
            
            <div className="mt-6 w-full space-y-2 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Try asking:</p>
              {[
                `Explain the core principles of ${subject.name} for beginners`,
                `Give me a real-world example of how ${subject.name} is applied`,
                `What are the most common pitfalls when learning ${subject.name}?`
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(starter)}
                  className="w-full text-left p-2.5 text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-200 transition"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>

        ) : (
          
          /* Message List */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id || index}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap font-normal">
                    {msg.text}
                  </div>
                  
                  {msg.timestamp && (
                    <div className={`mt-1.5 text-[10px] text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator when waiting for Gemini */}
        {sending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 ml-1">StudyMate AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-sm">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${subject.name}... (Press Enter to send)`}
            disabled={sending}
            className="flex-1 max-h-36 px-3 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-slate-800 placeholder-slate-400 disabled:opacity-50 custom-scrollbar"
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </button>
        </form>
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          subjectName={subject.name}
          onClose={() => setActiveQuiz(null)}
        />
      )}

    </div>
  );
}
