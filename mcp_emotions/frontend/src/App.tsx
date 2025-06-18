import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import EmotionDetector from './components/EmotionDetector';
import EmotionHistory from './components/EmotionHistory';
import UserHistory from './components/UserHistory';
import ProtectedRoute from './components/ProtectedRoute';
import Privacy from './components/Privacy';
import EmailVerified from './components/EmailVerified';
import logo from './assets/emotionwise.png';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for changes to localStorage (login/logout in other tabs)
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    // Also update on route change (in case login/logout happens in this tab)
    setIsAuthenticated(!!localStorage.getItem('token'));
    return () => window.removeEventListener('storage', handleStorage);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src={logo} alt="emotionwise.ai logo" className="h-10 w-10 mr-3 rounded-full shadow" />
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">emotionwise.ai</h1>
                  <div className="text-xs text-gray-500 font-medium tracking-wide">Decoding Emotions. Empowering Insight.</div>
                </div>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                  Emotion Detector
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/history" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                      Session History
                    </Link>
                    <Link to="/my-history" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                      My History
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Desktop Auth Links */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                    Login
                  </Link>
                  <Link to="/register" className="ml-4 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                    Register
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 rounded bg-red-500 text-white font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Logout
                </button>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {/* Menu icon */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Emotion Detector
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/history"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Session History
                </Link>
                <Link
                  to="/my-history"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My History
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-800"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <EmotionDetector />
            </ProtectedRoute>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={
            <ProtectedRoute>
              <EmotionHistory />
            </ProtectedRoute>
          } />
          <Route path="/my-history" element={
            <ProtectedRoute>
              <UserHistory />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/verify-email" element={<EmailVerified />} />
        </Routes>
      </main>
      <footer className="w-full py-6 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
        <span>&copy; {new Date().getFullYear()} emotionwise.ai &mdash; </span>
        <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
      </footer>
    </div>
  );
}

export default App;
