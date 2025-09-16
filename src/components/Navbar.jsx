import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Play', path: '/levels', icon: '⛳' },
    { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
    { name: 'Tournaments', path: '/tournaments', icon: '🏅' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const getDisplayName = () => {
    if (user?.isAnonymous) return 'Guest';
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Player';
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-20">
      <div className="bg-blue-950 font-game text-golf-green-500 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/dashboard"
                className="text-2xl font-bold text-golf-green-300 font-game hover:text-golf-green-200 transition-colors duration-200"
              >
                GOLF 3D
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-2xl px-3 py-2 text-golf-green-300 rounded-lg  font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActivePath(item.path)
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <div className="text-white/90 text-sm">
                  {getDisplayName()}
                  {user?.isAnonymous && (
                    <span className="ml-2 bg-yellow-500/20 text-yellow-300 px-2 py-1 font-game rounded-md text-xs">
                      Guest
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-sm border font-game border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 backdrop-blur-sm">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={` px-3 py-4 text-golf-green-300 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                    isActivePath(item.path)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-white/20 mt-2 pt-3">
                <div className="text-white/90 text-sm mb-2">
                  {getDisplayName()}
                  {user?.isAnonymous && (
                    <span className="ml-2 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md text-xs">
                      Guest
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}