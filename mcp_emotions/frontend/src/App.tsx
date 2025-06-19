import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EmotionDetector from './components/EmotionDetector';
import Login from './components/Login';
import Register from './components/Register';
import UserHistory from './components/UserHistory';
import FeedbackForm from './components/FeedbackForm';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerified from './components/EmailVerified';
import Privacy from './components/Privacy';

function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuthStatus();
      }
    };

    const handleAuthStateChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    window.location.href = '/';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">EmotionWise</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Detect Emotions
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/my-history') 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  My History
                </Link>
                <Link
                  to="/feedback"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/feedback') 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  Feedback
                </Link>
              </>
            )}
            <Link
              to="/privacy"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/privacy') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Privacy
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Detect Emotions
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/my-history"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/my-history') 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My History
                  </Link>
                  <Link
                    to="/feedback"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/feedback') 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Feedback
                  </Link>
                </>
              )}
              <Link
                to="/privacy"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/privacy') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy
              </Link>
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<EmotionDetector />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route 
            path="/my-history" 
            element={
              <ProtectedRoute>
                <UserHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <FeedbackForm />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
