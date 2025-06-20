import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, submitEmotionVote, submitFeedback } from '../api/client';

type EmotionType = 
  'admiration' | 'amusement' | 'anger' | 'annoyance' | 'approval' | 'caring' | 'confusion' | 
  'curiosity' | 'desire' | 'disappointment' | 'disapproval' | 'disgust' | 'embarrassment' | 
  'excitement' | 'fear' | 'gratitude' | 'grief' | 'joy' | 'love' | 'nervousness' | 'optimism' | 
  'pride' | 'realization' | 'relief' | 'remorse' | 'sadness' | 'surprise' | 'neutral';

const EMOTICONS: Record<EmotionType, string> = {
  'admiration': '👏', 'amusement': '😄', 'anger': '😠', 'annoyance': '😒',
  'approval': '👍', 'caring': '🤗', 'confusion': '😕', 'curiosity': '🤔',
  'desire': '😍', 'disappointment': '😞', 'disapproval': '👎', 'disgust': '🤮',
  'embarrassment': '😳', 'excitement': '🤩', 'fear': '😨', 'gratitude': '🙏',
  'grief': '😭', 'joy': '😃', 'love': '❤️', 'nervousness': '😬', 'optimism': '🌞',
  'pride': '🏅', 'realization': '💡', 'relief': '😌', 'remorse': '😔',
  'sadness': '😢', 'surprise': '😲', 'neutral': '😐'
};

export default function EmotionDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState<{ [emotion: string]: boolean | null }>({});
  const [voteStatus, setVoteStatus] = useState<{ [emotion: string]: string }>({});
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setFeedbackId(null);
    setVoted({});
    setVoteStatus({});

    try {
      const response = await apiClient.post('/tools/emotion-detector', { message: text });
      setResult(response.data);
      
      // Simple language detection for frontend (backend will do proper detection)
      let language = 'en'; // Default to English
      try {
        // Simple heuristic based on character patterns
        const hasSpanishChars = /[ñáéíóúü]/i.test(text);
        const hasSpanishWords = /\b(es|está|son|pero|con|una|por|para|desde|hasta|muy|más|también|año|años|día|días)\b/i.test(text);
        const hasEnglishWords = /\b(the|and|is|to|a|in|that|have|for|not|with|you|this|but|his|from|they|are|was|were|will|would)\b/i.test(text);
        
        if (hasSpanishChars || (hasSpanishWords && !hasEnglishWords)) {
          language = 'es';
        }
      } catch (e) {
        language = 'en'; // Default to English if detection fails
      }
      setDetectedLanguage(language);
      
      // Create a feedback record for voting
      if (response.data.detected_emotions && response.data.detected_emotions.length > 0) {
        try {
          const feedbackResponse = await submitFeedback({
            text: text,
            predicted_emotions: response.data.detected_emotions,
            suggested_emotions: [],
            comment: '',
            language_code: language,
          });
          setFeedbackId(feedbackResponse.data.id);
        } catch (feedbackError) {
          console.error('Failed to create feedback record:', feedbackError);
          // Continue without feedback record - voting will be disabled
        }
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError('An error occurred while detecting emotions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError('');
    setFeedbackId(null);
    setVoted({});
    setVoteStatus({});
    setDetectedLanguage(null);
  };

  const handleVote = async (emotion: string, vote: boolean) => {
    if (!result || !feedbackId) {
      console.error('No feedback ID available for voting');
      return;
    }
    
    const token = localStorage.getItem('token');
    setVoteStatus((prev) => ({ ...prev, [emotion]: 'loading' }));
    try {
      await submitEmotionVote({
        feedback_id: feedbackId,
        label: emotion,
        score: result.confidence_scores[emotion] / 100,
        vote,
        comment: '',
      }, token || undefined);
      setVoted((prev) => ({ ...prev, [emotion]: vote }));
      setVoteStatus((prev) => ({ ...prev, [emotion]: 'success' }));
    } catch (err) {
      console.error('Vote error:', err);
      setVoteStatus((prev) => ({ ...prev, [emotion]: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Emotion Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter text to detect emotions and sarcasm with AI-powered analysis
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter your text
                </label>
                <textarea
                  id="text-input"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                  placeholder="Share your thoughts, feelings, or any text you'd like to analyze..."
                  value={text}
                  maxLength={1000}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>1-1000 characters</span>
                  <span className={`font-medium ${text.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                    {text.length}/1000
                  </span>
                </div>
                {text.length > 1000 && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    Message cannot exceed 1000 characters.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading || text.length === 0 || text.length > 1000}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Detect Emotions'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                      {error.includes('login') && (
                        <div className="mt-2">
                          <Link to="/login" className="text-sm font-medium text-red-700 hover:text-red-600 underline">
                            Click here to login →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className="mt-8 animate-in slide-in-from-bottom-2 duration-500">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
                  
                  {/* Session Info */}
                  {result.session_id && (
                    <div className="mb-4 p-3 bg-white/60 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Session ID: <span className="font-mono text-gray-800">{result.session_id}</span>
                        {detectedLanguage && (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Language: {detectedLanguage.toUpperCase()}
                          </span>
                        )}
                        <Link to="/my-history" className="ml-3 text-indigo-600 hover:text-indigo-800 underline">
                          View my history
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Feedback Status */}
                  {feedbackId && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-700">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Feedback record created (ID: {feedbackId}) - Voting enabled
                      </div>
                    </div>
                  )}

                  {result.detected_emotions && result.detected_emotions.length > 0 && !feedbackId && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-sm text-yellow-700">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Creating feedback record for voting...
                      </div>
                    </div>
                  )}

                  {/* Emotions Table */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Emotion
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Confidence
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(result.detected_emotions) && result.detected_emotions.length > 0 ? (
                            result.detected_emotions.map((emotion: string) => (
                              <tr key={emotion} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-lg shadow-sm mr-3">
                                      {EMOTICONS[emotion as EmotionType] || '❓'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                      {emotion}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                      {result.confidence_scores[emotion]}%
                                    </span>
                                    <div className="flex-1 max-w-24 sm:max-w-32">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${result.confidence_scores[emotion]}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    {/* Voting Buttons */}
                                    <div className="flex items-center space-x-1">
                                      {!feedbackId ? (
                                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                          Vote unavailable
                                        </span>
                                      ) : voted[emotion] === undefined ? (
                                        <>
                                          <button
                                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                            onClick={() => handleVote(emotion, true)}
                                            aria-label="Like"
                                            disabled={voteStatus[emotion] === 'loading'}
                                          >
                                            👍
                                          </button>
                                          <button
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                            onClick={() => handleVote(emotion, false)}
                                            aria-label="Dislike"
                                            disabled={voteStatus[emotion] === 'loading'}
                                          >
                                            👎
                                          </button>
                                        </>
                                      ) : voteStatus[emotion] === 'success' ? (
                                        <span className="text-sm text-green-600 font-medium">
                                          Thank you!
                                        </span>
                                      ) : voteStatus[emotion] === 'error' ? (
                                        <span className="text-sm text-red-600 font-medium">
                                          Error
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center" colSpan={2}>
                                No emotions detected
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 space-y-4">
                    {/* Sarcasm Detection */}
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-gray-200">
                      <span className="font-medium text-gray-900">Sarcasm Detection:</span>
                      {result.sarcasm_detected ? (
                        <span className="flex items-center space-x-2 text-green-700 bg-green-100 rounded-full px-3 py-1 font-semibold text-sm">
                          <span>✔️</span>
                          <span>Detected</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2 text-red-700 bg-red-100 rounded-full px-3 py-1 font-semibold text-sm">
                          <span>❌</span>
                          <span>Not detected</span>
                        </span>
                      )}
                    </div>

                    {/* Recommendation */}
                    {result.recommendation && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <span className="font-medium text-blue-900">Recommendation:</span>
                            <p className="text-blue-800 mt-1">{result.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
