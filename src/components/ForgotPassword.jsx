import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import ThreeScene from './ThreeScene';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later';
      }
      
      toast.error(message);
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
      
      {/* Form Overlay */}
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
                    Enter your email to receive reset instructions
                  </p>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
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
                      'SEND RESET EMAIL'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 font-game">
                    EMAIL SENT!
                  </h2>
                  <p className="text-white/80 mb-6">
                    Check your inbox for password reset instructions. The email may take a few minutes to arrive.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full bg-gradient-to-r from-golf-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 font-game text-center"
                    >
                      BACK TO LOGIN
                    </Link>
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className="block w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium py-2 px-4 rounded-xl hover:bg-white/30 transition-all duration-300"
                    >
                      Send Another Email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}