import { useState, useEffect } from 'react';
import { submitFeedback, getFeedbackList } from '../api/client';

interface FeedbackFormProps {
  text?: string;
  predicted_emotions?: string[];
  language_code?: string;
  onSuccess?: () => void;
}

const EMOTION_LIST = [
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion', 'curiosity',
  'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude',
  'grief', 'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization', 'relief', 'remorse', 'sadness',
  'surprise', 'neutral'
];

// Language mapping for display
const LANGUAGE_NAMES: { [key: string]: string } = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic'
};

export default function FeedbackForm({ text = '', predicted_emotions = [], language_code, onSuccess }: FeedbackFormProps) {
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [suggestInput, setSuggestInput] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<any>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (showHistory && feedbackHistory.length === 0) {
      fetchFeedbackHistory();
    }
  }, [showHistory]);

  const fetchFeedbackHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await getFeedbackList(token || undefined);
      setFeedbackHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch feedback history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

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
    setSubmittedFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const response = await submitFeedback({
        text,
        predicted_emotions,
        suggested_emotions: suggestedEmotions,
        comment,
        language_code,
      }, token || undefined);
      
      setSubmittedFeedback(response.data);
      setSuccess('Thank you for your feedback!');
      setSuggestedEmotions([]);
      setComment('');
      
      // Refresh feedback history if it's currently showing
      if (showHistory) {
        fetchFeedbackHistory();
      }
      
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
                    {/* Show detected language if available */}
                    {language_code && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Language: {LANGUAGE_NAMES[language_code] || language_code.toUpperCase()}
                        </span>
                      </div>
                    )}
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
                        {/* Show feedback details if available */}
                        {submittedFeedback && (
                          <div className="mt-2 text-xs text-green-600">
                            <p>Feedback ID: {submittedFeedback.id}</p>
                            {submittedFeedback.language_id && (
                              <p>Language ID: {submittedFeedback.language_id}</p>
                            )}
                            {submittedFeedback.language_code && (
                              <p>Detected Language: {LANGUAGE_NAMES[submittedFeedback.language_code] || submittedFeedback.language_code.toUpperCase()}</p>
                            )}
                          </div>
                        )}
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

        {/* Feedback History Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Feedback History</h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 font-medium"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>

            {showHistory && (
              <div>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feedback history...</p>
                  </div>
                ) : feedbackHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No feedback submitted yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Text
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Predicted Emotions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Suggested
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feedbackHistory.map((feedback) => (
                          <tr key={feedback.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {feedback.id}
                            </td>
                            <td className="px-4 py-4">
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-900 truncate" title={feedback.text}>
                                  {feedback.text.length > 50 ? `${feedback.text.slice(0, 50)}...` : feedback.text}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {feedback.language_code ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {LANGUAGE_NAMES[feedback.language_code] || feedback.language_code.toUpperCase()}
                                </span>
                              ) : feedback.language_id ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  ID: {feedback.language_id}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {feedback.predicted_emotions.slice(0, 2).map((emotion: string, index: number) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {emotion}
                                  </span>
                                ))}
                                {feedback.predicted_emotions.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{feedback.predicted_emotions.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {feedback.suggested_emotions && feedback.suggested_emotions.length > 0 ? (
                                  feedback.suggested_emotions.slice(0, 2).map((emotion: string, index: number) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {emotion}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">None</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(feedback.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 