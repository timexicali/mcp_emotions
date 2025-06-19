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
    apiClient.get(`/api/v1/users/verify-email?token=${token}`)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-8">
          {status === 'pending' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Success Message */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600">
                  Your email address has been successfully verified. You can now sign in to your account.
                </p>
              </div>

              {/* Action Button */}
              <Link
                to="/login"
                className="inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Sign In to Your Account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Error Message */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Try Again
                </Link>
                
                <div>
                  <Link
                    to="/"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    ← Back to home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info for Success */}
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-left">
                  <p className="text-sm text-blue-800">
                    <strong>What's next?</strong> You can now access all features including emotion detection, history tracking, and feedback submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 