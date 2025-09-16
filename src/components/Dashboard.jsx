import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThreeScene from './ThreeScene';
import Navbar from './Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Player';
  };

  // Handle entering the game
  const handleEnterGame = () => {
    navigate('/levels');
  };

  return (
    <div className="relative w-full h-screen overflow-auto bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
          {/* 3D Background */}
          <div className="fixed inset-0 w-full h-full">
            <ThreeScene className="w-full h-full" />
          </div>
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-fuchsia-950 mb-4 font-game">
              WELCOME
            </h1>
            <h2 className="text-3xl md:text-5xl  font-game text-fuchsia-950 mb-2">
              {getDisplayName()}!
            </h2>
            <p className="text-lg font-game text-fuchsia-950">
              How's it goin bro?
            </p>
          </div>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Enter Game Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-golf-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⛳</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-game">
                  PLAY GOLF
                </h3>
                <p className="text-white text-sm mb-4">
                  Start a new round of minigolf
                </p>
                <button 
                  onClick={handleEnterGame}
                  className="bg-gradient-to-r from-golf-green-800 to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg font-game"
                >
                  ENTER GAME
                </button>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-game">
                  STATS
                </h3>
                <p className="text-white font-game text-sm mb-4">
                  View your game statistics
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between font-game text-white/90 text-sm">
                    <span>Games Played:</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between font-game text-white/90 text-sm">
                    <span>Best Score:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between font-game text-white/90 text-sm">
                    <span>Rank:</span>
                    <span>Unranked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-game">
                  LEADERBOARD
                </h3>
                <p className="text-white font-game text-sm mb-4">
                  Global rankings and tournaments
                </p>
                <button className="bg-gradient-to-r from-golf-green-800 to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg font-game">
                  VIEW RANKINGS
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20  rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 font-game text-center">
              COMING SOON...
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🎮', label: 'Tutorial', action: 'Coming Soon', onClick: null },
                { icon: '👥', label: 'Multiplayer', action: 'Coming Soon', onClick: null },
                { icon: '🏅', label: 'Tournaments', action: 'Coming Soon', onClick: null },
                { icon: '⚙️', label: 'Settings', action: 'Coming Soon', onClick: null }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick || undefined}
                  disabled={!item.onClick}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 text-center disabled:opacity-65 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-white font-game font-medium text-sm">{item.label}</div>
                  <div className="text-white font-game text-xs mt-1">{item.action}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-32 left-10 w-4 h-4 bg-white rounded-full animate-bounce delay-300 opacity-60"></div>
      <div className="absolute top-48 right-16 w-3 h-3 bg-golf-green-300 rounded-full animate-bounce delay-500 opacity-70"></div>
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-white rounded-full animate-bounce delay-700 opacity-50"></div>
      <div className="absolute bottom-40 right-12 w-6 h-6 bg-golf-green-400 rounded-full animate-bounce delay-1000 opacity-60"></div>
    </div>
  );
}