import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token provided.');
      return;
    }
    apiClient.get(`/users/verify-email?token=${token}`)
      .then(res => {
        if (res.data.success) {
          setStatus('success');
          setMessage('Thank you for confirming your email! Your email has been verified and you can now log in.');
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {status === 'pending' && <div className="text-gray-500">Verifying...</div>}
        {status === 'success' && (
          <>
            <div className="flex flex-col items-center mb-4">
              <span className="text-5xl text-green-500 mb-2">✔️</span>
              <div className="text-green-700 font-semibold text-lg mb-2">Thank you for confirming your email!</div>
              <div className="text-gray-700 mb-2">Your email has been verified and you can now log in.</div>
            </div>
            <Link to="/login" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium shadow">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <span className="text-5xl text-red-500 mb-2">❌</span>
            <div className="text-red-600 font-semibold mb-2">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
} 