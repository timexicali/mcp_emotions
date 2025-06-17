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
  const groupedLogs: Record<string, EmotionLog[]> = {};
  logs.forEach(log => {
    if (!groupedLogs[log.session_id]) {
      groupedLogs[log.session_id] = [];
    }
    groupedLogs[log.session_id].push(log);
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Your Emotion Detection History
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          All your previous emotion detection sessions
        </p>
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading your history...</div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {!loading && !error && Object.keys(groupedLogs).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No history found. Try detecting emotions first!</p>
        </div>
      )}

      {Object.entries(groupedLogs).map(([sessionId, sessionLogs]) => (
        <div key={sessionId} className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Session ID: {sessionId}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {new Date(sessionLogs[0]?.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sarcasm</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessionLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-900">{log.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.emotions && log.emotions.length > 0 ? log.emotions.join(', ') : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.context}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.sarcasm_detected ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 