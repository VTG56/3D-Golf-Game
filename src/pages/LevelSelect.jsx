import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { levels, getTotalStarsAvailable } from '../utils/levels';
import LevelCard from '../components/LevelCard';
import ThreeScene from '../components/ThreeScene';
import toast from 'react-hot-toast';

/**
 * LevelSelect Page - Shows available levels with unlock/play functionality
 * Supports both authenticated users and guests
 */
export default function LevelSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProgress, loading: progressLoading, getGuestId } = useProgress();
  
  const [playerProgress, setPlayerProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load player progress on component mount
  useEffect(() => {
    loadPlayerProgress();
  }, [user]);

  const loadPlayerProgress = async () => {
    try {
      setLoading(true);
      
      let progressData;
      if (user && !user.isAnonymous) {
        // Authenticated user - get from Firestore
        progressData = await getProgress({ uid: user.uid });
      } else {
        // Guest user - get from localStorage
        const guestId = getGuestId();
        if (guestId) {
          progressData = await getProgress({ guestId });
        } else {
          // No guest data, initialize empty progress
          progressData = {
            levelStats: {},
            totalStars: 0,
            gamesPlayed: 0
          };
        }
      }
      
      setPlayerProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
      //toast.error('Failed to load progress data');
      toast.error('WOrK iN pROgrESS');
      // Set empty progress as fallback
      setPlayerProgress({
        levelStats: {},
        totalStars: 0,
        gamesPlayed: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if level is unlocked based on player progress
  const isLevelUnlocked = (level) => {
    if (level.unlocked) return true; // First level or explicitly unlocked
    if (!playerProgress) return false;
    return playerProgress.totalStars >= level.unlockCost;
  };

  // Handle level play
  const handlePlayLevel = (levelId) => {
    navigate(`/game/${levelId}`);
  };

  // Handle level unlock
  const handleUnlockLevel = async (levelId) => {
    const level = levels.find(l => l.id === levelId);
    if (!level || !playerProgress) return;

    if (playerProgress.totalStars >= level.unlockCost) {
      // In a full implementation, you might want to deduct stars for unlocking
      // For now, we just mark it as available to play
      toast.success(`${level.name} unlocked!`);
      // Refresh progress to reflect any changes
      await loadPlayerProgress();
    } else {
      toast.error('Not enough stars to unlock this level');
    }
  };

  // Get user display name
  const getDisplayName = () => {
    if (user && !user.isAnonymous && user.displayName) {
      return user.displayName;
    }
    if (user && !user.isAnonymous && user.email) {
      return user.email.split('@')[0];
    }
    return 'Guest Player';
  };

  // Show loading state
  if (loading || progressLoading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
        <div className="absolute inset-0">
          <ThreeScene className="w-full h-full" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <p className="text-white font-game font-medium text-lg">Loading levels...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* 3D Background */}
      <div className="fixed inset-0 h-full w-full">
              <ThreeScene className="w-full h-full" />
            </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className=" pb-6">
          {/* Navigation */}
          <div className="max-w-full min-h-16 text-2xl  mx-auto bg-blue-950 font-game flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-golf-green-300 hover:text-white transition-colors duration-200 font-medium"
            >
              <span className="mr-2 lg:ml-10">←</span>
              Back to Dashboard
            </button>

            {/* Player Info */}
            <div className="text-right">
              
              {user && user.isAnonymous && (
                <div className="text-golf-green-300 text-sm">Guest Mode</div>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="max-w-6xl mx-auto text-center mb-8">
            <h1 className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto text-4xl md:text-5xl lg:text-6xl font-bold text-fuchsia-950 mb-4 font-game">
              SELECT LEVEL
            </h1>
            
            {/* Progress Summary */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-500 font-game">
                    {playerProgress?.totalStars || 0}
                  </div>
                  <div className="text-fuchsia-950 font-game text-lg font-bold">Stars Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500 font-game">
                    {getTotalStarsAvailable()}
                  </div>
                  <div className="text-fuchsia-950 font-game font-bold text-lg">Total Stars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500 font-game">
                    {levels.filter(level => isLevelUnlocked(level)).length}
                  </div>
                  <div className="text-fuchsia-950 font-game font-bold text-lg">Levels Unlocked</div>
                </div>
              </div>
            </div>

            {/* Guest Mode Notice */}
            {user && user.isAnonymous && (
              <div className="mt-4 bg-red-600 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 max-w-2xl mx-auto">
                <div className="text-yellow-200 font-game text-sm">
                  <strong>Playing as Guest:</strong> Progress is saved locally. 
                  <button 
                    onClick={() => navigate('/signup')} 
                    className="ml-1 underline hover:text-yellow-100"
                  >
                    Create account
                  </button> to save progress.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Levels Grid */}
        <div className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  playerStats={playerProgress}
                  isUnlocked={isLevelUnlocked(level)}
                  playerTotalStars={playerProgress?.totalStars || 0}
                  onPlay={handlePlayLevel}
                  onUnlock={handleUnlockLevel}
                />
              ))}
            </div>

            {/* Coming Soon Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={`coming-soon-${i}`}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center opacity-90"
                >
                  <div className="text-white/50 mb-4">
                    <div className="text-4xl mb-2">🚧</div>
                    <div className="text-lg font-game">COMING SOON</div>
                  </div>
                  <div className="text-white/40 font-game text-sm">
                    More exciting levels in development!
                  </div>
                </div>
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