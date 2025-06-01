// Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import footballBg from "../assets/images/efootbalBG5.png";

function Login() {
  const [id_account, setIdAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // add loading state
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // set loading to true on submit
    try {
      await axios.post(
        'http://localhost:5000/connection/login',
        { id_account, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setLoading(false); // set loading to false on success
      navigate('/');
    } catch (err) {
      setLoading(false); // set loading to false on error
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />
      
      {/* Header */}
      <header className="w-full flex justify-between items-center p-3 sm:px-6 sm:py-4 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link 
          to="/"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </header>
    
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-14 sm:pt-16 pb-16 sm:pb-20 px-3 sm:px-4">
        <section className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-1 sm:mb-2">Sign In</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Access your football match tracker account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-xs sm:text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                className="ml-2 text-red-400 hover:text-red-700 font-bold text-lg leading-none focus:outline-none"
                onClick={() => setError('')}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
    
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="id_account"
                className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm"
              >
                Game ID
              </label>
              <input
                type="text"
                id="id_account"
                name="id_account"
                placeholder="Enter your game ID"
                value={id_account}
                onChange={(e) => setIdAccount(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold px-4 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-600 text-sm sm:text-base"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
            >
              Register
            </Link>
          </div>
        </section>
      </main>
    
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-800 to-blue-700 text-white text-center py-5 sm:py-4 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-xs sm:text-sm md:text-base">
            PesScore © 2025 - Football Match Tracker
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Login;