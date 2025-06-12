import { useState } from 'react';
import axios from 'axios';

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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/tools/emotion-detector',
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
    } catch (e) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Emotion Detection
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter text to detect emotions and sarcasm.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="mt-1">
              <textarea
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="mt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Detecting...' : 'Detect Emotions'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {result && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-gray-900">Results:</h4>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emotion}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.confidence_scores && result.confidence_scores[emotion] !== undefined ? result.confidence_scores[emotion] : '-'}</td>
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
                  <span className="font-medium">Sarcasm:</span> {result.sarcasm_detected ? 'Yes' : 'No'}
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
