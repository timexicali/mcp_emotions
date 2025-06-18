import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';

interface EmotionLog {
  message: string;
  emotions: string[];
  context: string;
  sarcasm_detected: boolean;
  timestamp: string;
}

export default function EmotionHistory() {
  const { sessionId } = useParams();
  const [history, setHistory] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get(`/tools/emotion-history/${sessionId}`);
        setHistory(response.data);
      } catch (e: any) {
        setError(e.response?.data?.detail || 'Failed to load emotion history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [sessionId]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Session History</h3>
          <div className="mb-4 text-gray-500">All messages and detected emotions for this session.</div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          ) : history && history.history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No history found. Enter a session ID to view logs.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sarcasm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.history.map((log: EmotionLog, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-900">{log.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.emotions && log.emotions.length > 0 ? log.emotions.join(', ') : <span className="text-gray-400">None</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.sarcasm_detected ? <span className="text-yellow-600">Yes</span> : <span className="text-gray-400">No</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 