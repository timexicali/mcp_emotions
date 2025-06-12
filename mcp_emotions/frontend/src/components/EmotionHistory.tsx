import { useState } from 'react';
import axios from 'axios';

interface EmotionLog {
  message: string;
  emotions: string[];
  context: string;
  sarcasm_detected: boolean;
  timestamp: string;
}

export default function EmotionHistory() {
  const [sessionId, setSessionId] = useState('');
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!sessionId) {
      setError('Please enter a session ID');
      return;
    }
    setLoading(true);
    setError('');
    setLogs([]);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }
      const response = await axios.get(`http://localhost:8000/tools/emotion-history/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLogs(response.data.history || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Emotion Detection History
        </h3>
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            className="input"
            placeholder="Enter session ID"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
          />
          <button
            onClick={fetchHistory}
            className="btn btn-primary"
            disabled={loading || !sessionId}
          >
            {loading ? 'Loading...' : 'Fetch History'}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {logs.length === 0 && !error ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No history found. Enter a session ID to view logs.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sarcasm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-900">{log.message}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.emotions && log.emotions.length > 0 ? log.emotions.join(', ') : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.context}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.sarcasm_detected ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 