import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Player';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white font-game">
              GOLF<span className="text-golf-green-400">3D</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-darkgreen/90 hover:text-darkgreen transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/play"
              className="text-darkgreen/90 hover:text-darkgreen transition-colors duration-200 font-medium"
            >
              Play
            </Link>
            <Link
              to="/leaderboard"
              className="text-darkgreen/90 hover:text-darkgreen transition-colors duration-200 font-medium"
            >
              Leaderboard
            </Link>
            <Link
              to="/tournaments"
              className="text-darkgreen/90 hover:text-darkgreen transition-colors duration-200 font-medium"
            >
              Tournaments
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="w-8 h-8 bg-golf-green-500 rounded-full flex items-center justify-center">
                  <span className="text-darkgreen text-sm font-bold">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-darkgreen/90 font-medium">
                {getDisplayName()}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-darkgreen px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-white transition-colors duration-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md border-t border-white/20 rounded-b-2xl">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-3 py-2 mb-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-golf-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{getDisplayName()}</p>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/play"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Play
              </Link>
              <Link
                to="/leaderboard"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link
                to="/tournaments"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tournaments
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium text-left"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}