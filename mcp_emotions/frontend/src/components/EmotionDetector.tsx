import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiClient.post('/tools/emotion-detector', { message: text });
      setResult(response.data);
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Emotion Detection</h3>
          <div className="mb-4 text-gray-500">Enter text to detect emotions and sarcasm.</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Detecting...' : 'Detect Emotions'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('login') && (
                    <div className="mt-2">
                      <Link to="/login" className="text-sm font-medium text-red-700 hover:text-red-600">
                        Click here to login <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900">Results</h4>
              {result.session_id && (
                <div className="mt-2 text-sm text-gray-500">
                  Session ID: <span className="font-mono">{result.session_id}</span>
                  <Link to="/my-history" className="ml-4 text-indigo-600 hover:text-indigo-900">View my history</Link>
                </div>
              )}
              <div className="mt-2 bg-gray-50 rounded-md p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(result.detected_emotions) && result.detected_emotions.length > 0 ? (
                      result.detected_emotions.map((emotion: string) => (
                        <tr key={emotion}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="mr-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 shadow-sm">{EMOTICONS[emotion as EmotionType] || '❓'}</span>
                            {emotion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.confidence_scores && result.confidence_scores[emotion] !== undefined ? 
                              <div className="flex items-center">
                                <span className="mr-2">{result.confidence_scores[emotion]}</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{width: `${Math.round(result.confidence_scores[emotion] * 100)}%`}}
                                  ></div>
                                </div>
                              </div> : '-'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>No emotions detected</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-4">
                  <span className="font-medium">Sarcasm:</span> {result.sarcasm_detected ? 
                    <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 shadow-sm">🔍</span> : 
                    <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 shadow-sm">👌</span>}
                </div>
                {result.recommendation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <span className="font-medium">Recommendation:</span> {result.recommendation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
