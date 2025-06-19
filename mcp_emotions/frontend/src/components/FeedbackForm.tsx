import { useState } from 'react';
import { submitFeedback } from '../api/client';

interface FeedbackFormProps {
  text?: string;
  predicted_emotions?: string[];
  onSuccess?: () => void;
}

const EMOTION_LIST = [
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion', 'curiosity',
  'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude',
  'grief', 'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization', 'relief', 'remorse', 'sadness',
  'surprise', 'neutral'
];

export default function FeedbackForm({ text = '', predicted_emotions = [], onSuccess }: FeedbackFormProps) {
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [suggestInput, setSuggestInput] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddSuggestion = () => {
    const val = suggestInput.trim().toLowerCase();
    if (val && !suggestedEmotions.includes(val) && EMOTION_LIST.includes(val)) {
      setSuggestedEmotions([...suggestedEmotions, val]);
    }
    setSuggestInput('');
  };

  const handleRemoveSuggestion = (emotion: string) => {
    setSuggestedEmotions(suggestedEmotions.filter(e => e !== emotion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await submitFeedback({
        text,
        predicted_emotions,
        suggested_emotions: suggestedEmotions,
        comment,
      }, token || undefined);
      setSuccess('Thank you for your feedback!');
      setSuggestedEmotions([]);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError('An error occurred while submitting feedback');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Feedback Form
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us improve our emotion detection by providing feedback
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Display - Only show if text is provided */}
              {text && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Text that was analyzed
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-900">{text}</p>
                  </div>
                </div>
              )}

              {/* Predicted Emotions Display - Only show if emotions are provided */}
              {predicted_emotions && predicted_emotions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Predicted emotions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predicted_emotions.map((emotion, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {emotion}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    These emotions were detected by the AI. Use the voting buttons (👍👎) to rate their accuracy.
                  </p>
                </div>
              )}

              {/* Suggested Emotions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Suggest missing emotions
                </label>
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="e.g. pride"
                    value={suggestInput}
                    onChange={(e) => setSuggestInput(e.target.value)}
                    list="emotion-list"
                  />
                  <button
                    type="button"
                    onClick={handleAddSuggestion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium"
                  >
                    Add
                  </button>
                  <datalist id="emotion-list">
                    {EMOTION_LIST.map(e => <option key={e} value={e} />)}
                  </datalist>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedEmotions.map((emotion, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {emotion}
                      <button
                        type="button"
                        className="ml-1.5 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        onClick={() => handleRemoveSuggestion(emotion)}
                        aria-label="Remove emotion"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
                  Additional comments
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                  placeholder="Any additional feedback or comments..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{comment.length}/500</div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 