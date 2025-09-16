import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThreeScene from './ThreeScene';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <ThreeScene className="w-full h-full" />
      </div>
      
      {/* Reset Password Form Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back to login */}
          <div className="mb-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-white/90 hover:text-white transition-colors duration-200 font-medium"
            >
              <span className="mr-2">←</span>
              Back to Login
            </Link>
          </div>

          {/* Reset Password Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
            {!emailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 font-game">
                    RESET PASSWORD
                  </h2>
                  <p className="text-white/80">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                {/* Reset Form */}
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-golf-green-400 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-golf-green-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg font-game text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'SEND RESET LINK'
                    )}
                  </button>
                </form>
              </>
            ) : (
              // Success State
              <>
                {/* Success Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-golf-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 font-game">
                    EMAIL SENT
                  </h2>
                  <p className="text-white/80">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-4 text-white/80 text-sm">
                  <p>Please check your email and follow the instructions to reset your password.</p>
                  <p>If you don't see the email, check your spam folder.</p>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Send Another Email
                  </button>
                  
                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-golf-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg font-game text-center"
                  >
                    BACK TO LOGIN
                  </Link>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-golf-green-300 hover:text-golf-green-200 font-semibold transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}