import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'At least 1 uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'At least 1 lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'At least 1 number (0-9)', test: (pw: string) => /\d/.test(pw) },
  { label: 'At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)', test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch password requirements
    const fetchRequirements = async () => {
      try {
        const response = await apiClient.get('/api/v1/users/password-requirements');
        setPasswordRequirements(response.data.requirements);
      } catch (e) {
        // fallback to hardcoded
        setPasswordRequirements(
          'Password must meet the following requirements:\n' +
          '• At least 8 characters\n' +
          '• At least 1 uppercase letter (A-Z)\n' +
          '• At least 1 lowercase letter (a-z)\n' +
          '• At least 1 number (0-9)\n' +
          '• At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
        );
      }
    };
    fetchRequirements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/v1/users/register', {
        name,
        email,
        password,
      });
      navigate('/login');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = passwordRules.map(rule => rule.test(password));
  const allValid = passwordChecks.every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500">Sign up to get started</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${touched.password && !allValid ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Password"
                value={password}
                onFocus={() => { setShowRequirements(true); setPasswordFocused(true); setTouched(t => ({ ...t, password: true })); }}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${touched.confirm && !passwordsMatch ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onFocus={() => setTouched(t => ({ ...t, confirm: true }))}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {touched.confirm && confirmPassword.length > 0 && (
                <div className={`mt-1 text-xs font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</div>
              )}
            </div>
          </div>

          {/* Password requirements, shown only when password is focused or being typed */}
          <div
            className={`transition-all duration-300 ${showRequirements && (passwordFocused || password.length > 0) ? 'opacity-100 max-h-96 mt-4' : 'opacity-0 max-h-0 overflow-hidden'}`}
            aria-live="polite"
          >
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Password Requirements</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {passwordRules.map((rule, idx) => (
                      <li key={idx} className="flex items-center">
                        {rule.test(password) ? (
                          <svg className="h-4 w-4 text-green-500 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="h-4 w-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !allValid || !passwordsMatch}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 