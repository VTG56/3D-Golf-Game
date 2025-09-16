import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { getLevelById } from '../utils/levels';
import GameScene from '../components/GameScene';
import EndOfRound from '../components/EndOfRound';
import toast from 'react-hot-toast';

/**
 * Game Page - Wrapper for the 3D game scene and UI
 * Handles level loading, game state, and result processing
 */
export default function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getGuestId } = useProgress();
  
  const [gameResult, setGameResult] = useState(null);
  const [showEndOfRound, setShowEndOfRound] = useState(false);

  const level = getLevelById(levelId);

  // Redirect if level not found
  useEffect(() => {
    if (!level) {
      toast.error('Level not found');
      navigate('/levels');
    }
  }, [level, navigate]);

  // Handle game completion
  const handleGameComplete = (result) => {
    setGameResult(result);
    setShowEndOfRound(true);
  };

  // Handle retry
  const handleRetry = () => {
    setGameResult(null);
    setShowEndOfRound(false);
    // GameScene will reset when these change
  };

  // Handle continue/close
  const handleContinue = () => {
    navigate('/levels');
  };

  const handleClose = () => {
    navigate('/levels');
  };

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-medium text-lg">Loading level...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/levels')}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200"
        >
          ← Back to Levels
        </button>
      </div>

      {/* Level Info */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-white text-sm">
          <div className="font-semibold">{level.name}</div>
          <div>Par {level.par}</div>
        </div>
      </div>

      {/* Game Scene */}
      <GameScene 
        level={level} 
        onComplete={handleGameComplete}
        key={`${levelId}-${gameResult ? 'retry' : 'initial'}`} // Force remount on retry
      />

      {/* End of Round Modal */}
      {showEndOfRound && gameResult && (
        <EndOfRound
          levelId={levelId}
          gameResult={gameResult}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={handleClose}
        />
      )}
    </div>
  );
}