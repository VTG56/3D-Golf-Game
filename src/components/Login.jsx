import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThreeScene from './ThreeScene';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-auto bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* 3D Background */}
      <div className="fixed inset-0 w-full h-full">
  <ThreeScene className="w-full h-full" />
</div>

      
      {/* Login Form Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md">
          

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl text-white drop-shadow-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-2 rounded-2xl py-3 font-game">
  WELCOME BACK
</h2>
<p className="text-black font-game">
  Login to continue your golf adventure
</p>

            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-gray-800 font-game font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center space-x-3"

            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 font-game text-white backdrop-blur-sm rounded-full">
  Or continue with email
</span>

              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-6 font-game">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-golf-green-400 focus:border-transparent transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-golf-green-400 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 sm:py-4 px-5 sm:px-6 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg font-game text-base sm:text-lg"

              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging In...</span>
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>
            <div className="flex items-center justify-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-white mt-8 hover:text-white transition-colors duration-200 font-game underline underline-offset-4 hover:scale-110"
                >
                  Forgot password?
                </Link>
              </div>
            {/* Footer */}
            <div className="mt-8 text-center font-game">
              <p className="text-white">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-white hover:text-golf-green-200 font-semibold transition-colors duration-200 underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
            {/* Back to home */}
          
          </div>
          {/* Back to home */}
          <div className="mb-6 text-center">
            <Link
              to="/"
              className="inline-flex font-game mt-5 underline items-center text-white hover:text-black transition-colors duration-200 font-medium"
            >
              <span className="mr-2">←</span>
              Back to Home
            </Link>
          </div>
        <footer className="mt-10 pb-3 sm:pb-2 md:pb-3 w-full text-center text-xs sm:text-sm text-white/70 font-game">
  © CODEX FRIEZA 2025 
</footer>
        </div>
        
      </div>
      
    </div>
  );
}