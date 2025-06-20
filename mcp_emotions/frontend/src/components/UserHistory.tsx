import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface EmotionLog {
  id: number;
  session_id: string;
  text: string;
  detected_emotions: string[];
  confidence_scores: { [key: string]: number };
  sarcasm_detected: boolean;
  created_at: string;
}

export default function UserHistory() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [expandedTexts, setExpandedTexts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/tools/emotion-history/user/detailed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform backend data to frontend format
      const transformedLogs = response.data.history.map((log: any, index: number) => ({
        id: index + 1, // Generate a simple ID
        session_id: log.session_id,
        text: log.message,
        detected_emotions: log.emotions,
        confidence_scores: log.confidence_scores || {},
        sarcasm_detected: log.sarcasm_detected,
        created_at: log.timestamp
      }));
      
      setLogs(transformedLogs);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError('Failed to load history');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleExpandRow = (logId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(logId)) {
      newExpandedRows.delete(logId);
    } else {
      newExpandedRows.add(logId);
    }
    setExpandedRows(newExpandedRows);
  };

  const toggleExpandText = (logId: number) => {
    const newExpandedTexts = new Set(expandedTexts);
    if (newExpandedTexts.has(logId)) {
      newExpandedTexts.delete(logId);
    } else {
      newExpandedTexts.add(logId);
    }
    setExpandedTexts(newExpandedTexts);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Emotion History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View your past emotion detection sessions and results
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
              <p className="text-gray-600">Start analyzing emotions to see your history here.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Text
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detected Emotions
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sarcasm
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => {
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="max-w-sm">
                              {expandedTexts.has(log.id) ? (
                                <div>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                                    {log.text}
                                  </p>
                                  {log.text.length > 100 && (
                                    <button
                                      onClick={() => toggleExpandText(log.id)}
                                      className="mt-2 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors duration-200 font-medium"
                                    >
                                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                      Show less
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-900 line-clamp-3" title={log.text}>
                                    {truncateText(log.text)}
                                    {log.text.length > 100 && '...'}
                                  </p>
                                  {log.text.length > 100 && (
                                    <button
                                      onClick={() => toggleExpandText(log.id)}
                                      className="mt-1 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors duration-200 font-medium"
                                    >
                                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                      Show more
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {log.detected_emotions && log.detected_emotions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {(expandedRows.has(log.id) ? log.detected_emotions : log.detected_emotions.slice(0, 3)).map((emotion, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                    {emotion}
                                  </span>
                                ))}
                                {log.detected_emotions.length > 3 && (
                                  <button
                                    onClick={() => toggleExpandRow(log.id)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors duration-200"
                                  >
                                    {expandedRows.has(log.id) 
                                      ? 'Show less' 
                                      : `+${log.detected_emotions.length - 3} more`
                                    }
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">None detected</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {log.sarcasm_detected ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Detected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                None
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <code className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              {log.session_id}
                            </code>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing {logs.length} emotion detection session{logs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
} 