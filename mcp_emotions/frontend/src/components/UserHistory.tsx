import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

interface EmotionLog {
  session_id: string;
  message: string;
  emotions: string[];
  context: string;
  sarcasm_detected: boolean;
  timestamp: string;
}

export default function UserHistory() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/tools/emotion-history/user');
        setLogs(response.data.history || []);
      } catch (e: any) {
        setError(e.response?.data?.detail || 'Failed to load user history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Group logs by session ID
  const grouped = logs.reduce((acc: Record<string, EmotionLog[]>, log) => {
    acc[log.session_id] = acc[log.session_id] || [];
    acc[log.session_id].push(log);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">My History</h3>
          <div className="mb-4 text-gray-500">All your emotion detection sessions, grouped by session.</div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No history found.</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([sessionId, sessionLogs]) => (
                <div key={sessionId} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-indigo-700">Session ID: <span className="font-mono text-xs text-gray-700">{sessionId}</span></span>
                    <Link to={`/history/${sessionId}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View Session</Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotions</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sarcasm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sessionLogs.map((log, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 whitespace-pre-line text-sm text-gray-900">{log.message}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{log.emotions && log.emotions.length > 0 ? log.emotions.join(', ') : <span className="text-gray-400">None</span>}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{log.sarcasm_detected ? <span className="text-yellow-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                            <td className="px-4 py-2 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 