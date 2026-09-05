import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function QuizModal({ quiz, subjectName, onClose }) {
  const questions = quiz?.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Reset state when a new quiz is loaded
  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [quiz]);

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (submitted) return; // Locked after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);

    // Trigger confetti if score is passing (>= 60%)
    if (calculatedScore >= 3) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // canvas-confetti optional fallback
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = questions.length > 0 && 
    questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {subjectName} AI Comprehension Quiz
              </h2>
              <p className="text-xs text-slate-500">
                5 questions generated from your tutoring conversation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Score Card Banner when submitted */}
          {submitted && (
            <div className={`p-6 rounded-2xl border text-center transition-all ${
              score >= 4 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : score >= 3 
                ? 'bg-blue-50 border-blue-200 text-blue-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-3">
                <Award className={`w-8 h-8 ${
                  score >= 4 ? 'text-emerald-500' : score >= 3 ? 'text-blue-500' : 'text-amber-500'
                }`} />
              </div>
              <h3 className="text-2xl font-black">
                You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </h3>
              <p className="mt-1 text-sm font-medium opacity-90">
                {score === 5 && '🌟 Perfect score! You have completely mastered these concepts!'}
                {score === 4 && '🎉 Great job! Strong understanding with only one minor gap.'}
                {score === 3 && '👍 Good effort! Review the questions below to reinforce key points.'}
                {score < 3 && '💡 Keep practicing! Review the explanations in chat and try again.'}
              </p>
            </div>
          )}

          {/* Question list */}
          {questions.map((q, qIndex) => {
            const userAnswer = selectedAnswers[qIndex];
            const isCorrect = userAnswer === q.correctAnswerIndex;

            return (
              <div 
                key={qIndex} 
                className={`p-5 rounded-2xl border transition-all ${
                  submitted 
                    ? isCorrect 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-red-200 bg-red-50/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                {/* Question Title */}
                <div className="flex items-start space-x-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    Q{qIndex + 1}
                  </span>
                  <h4 className="text-base font-semibold text-slate-800 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2.5 pl-10">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = userAnswer === optIndex;
                    const isTheCorrectOption = q.correctAnswerIndex === optIndex;

                    let optionStyle = 'border-slate-200 hover:bg-white bg-white/70 text-slate-700';

                    if (submitted) {
                      if (isTheCorrectOption) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-800 line-through';
                      } else {
                        optionStyle = 'border-slate-200 bg-white/40 text-slate-400 opacity-75';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold ring-2 ring-blue-500';
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => handleSelectOption(qIndex, optIndex)}
                        disabled={submitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center uppercase">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {submitted && (
                          <div>
                            {isTheCorrectOption && (
                              <span className="flex items-center text-emerald-600 text-xs font-bold space-x-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Correct</span>
                              </span>
                            )}
                            {isSelected && !isTheCorrectOption && (
                              <span className="flex items-center text-red-500 text-xs font-bold space-x-1">
                                <XCircle className="w-4 h-4" />
                                <span>Incorrect</span>
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {!submitted ? (
              <span>
                Answered {Object.keys(selectedAnswers).length} of {questions.length} questions
              </span>
            ) : (
              <span>Review your results above</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {submitted ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-sm font-semibold rounded-xl transition"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  Done
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
