import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { getLevelById, getNextLevel } from '../utils/levels';
import toast from 'react-hot-toast';

/**
 * EndOfRound Modal - Shows completion stats and handles progression
 * Supports both authenticated users and guests with save/migration options
 */
export default function EndOfRound({ 
  levelId, 
  gameResult, 
  onRetry, 
  onContinue, 
  onClose 
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProgress, migrateGuestToUser, getGuestId, loading, initializeGuest } = useProgress();
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const level = getLevelById(levelId);
  const nextLevel = getNextLevel(levelId);

  // Auto-save progress when modal opens
  useEffect(() => {
    if (gameResult && !saved) {
      saveProgress();
    }
  }, [gameResult, saved]);

  // Star animation state
  const [animatedStars, setAnimatedStars] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedStars < gameResult.starsEarned) {
        setAnimatedStars(prev => prev + 1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [animatedStars, gameResult.starsEarned]);

  const saveProgress = async () => {
    try {
      setSaving(true);
      
      if (user && !user.isAnonymous) {
        // Save to Firestore for authenticated user
        await setProgress({
          uid: user.uid,
          levelId,
          strokes: gameResult.strokes,
          stars: gameResult.starsEarned,
          timeTaken: gameResult.timeTaken
        });
      } else {
        // Save to localStorage for guest
        let guestId = getGuestId();
        if (!guestId) {
          guestId = await initializeGuest();
        }
        await setProgress({
          guestId,
          levelId,
          strokes: gameResult.strokes,
          stars: gameResult.starsEarned,
          timeTaken: gameResult.timeTaken
        });
        
        // Show guest upgrade prompt if they earned stars
        if (gameResult.starsEarned > 0) {
          setShowGuestPrompt(true);
        }
      }
      
      setSaved(true);
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  // Handle retry level
  const handleRetry = () => {
    setSaved(false);
    setAnimatedStars(0);
    onRetry();
  };

  // Handle continue to next level
  const handleNextLevel = () => {
    if (nextLevel) {
      navigate(`/game/${nextLevel.id}`);
    } else {
      navigate('/levels');
    }
  };

  // Handle return to level select
  const handleLevelSelect = () => {
    navigate('/levels');
  };

  // Handle guest signup
  const handleGuestSignup = () => {
    // Store game result to continue after signup
    sessionStorage.setItem('pendingGameResult', JSON.stringify({
      levelId,
      gameResult
    }));
    navigate('/signup');
  };

  // Get performance message
  const getPerformanceMessage = () => {
    const { starsEarned, strokes, par } = gameResult;
    if (starsEarned === 3) return 'INCREDIBLE!';
    if (starsEarned === 2) return 'EXCELLENT!';
    if (starsEarned === 1) return 'NICE SHOT!';
    return 'KEEP TRYING!';
  };

  // Get score description
  const getScoreDescription = () => {
    const { strokes, par } = gameResult;
    const diff = strokes - par;
    if (diff <= -2) return 'Eagle or Better!';
    if (diff === -1) return 'Birdie!';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    return 'Double Bogey+';
  };

  // Render star with animation
  const renderStar = (index, filled) => (
    <div
      key={index}
      className={`text-4xl transition-all duration-500 transform ${
        filled && animatedStars > index
          ? 'text-yellow-400 scale-125 rotate-12'
          : 'text-white/30 scale-100 rotate-0'
      }`}
      style={{
        transitionDelay: `${index * 200}ms`
      }}
    >
      ★
    </div>
  );

  if (!gameResult) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 font-game">
            {getPerformanceMessage()}
          </h2>
          <h3 className="text-xl text-white/90 mb-4">
            {level?.name} Complete
          </h3>
        </div>

        {/* Results Display */}
        <div className="space-y-6 mb-8">
          {/* Stars Earned */}
          <div className="text-center">
            <div className="text-white/90 text-sm mb-2">Stars Earned</div>
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2].map(i => renderStar(i, i < gameResult.starsEarned))}
            </div>
            
            {/* Confetti effect for 3 stars */}
            {gameResult.starsEarned === 3 && animatedStars >= 3 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Simple CSS confetti animation */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 animate-bounce"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 40}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Score Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-white">
              <span>Strokes:</span>
              <span className="font-bold">{gameResult.strokes}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Par:</span>
              <span>{gameResult.par}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Score:</span>
              <span className={`font-bold ${
                gameResult.strokes <= gameResult.par 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                {getScoreDescription()}
              </span>
            </div>
            {gameResult.timeTaken && (
              <div className="flex justify-between text-white">
                <span>Time:</span>
                <span>{Math.floor(gameResult.timeTaken / 60)}:{(gameResult.timeTaken % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Save Status */}
          <div className="text-center">
            {saving && (
              <div className="text-white/80 text-sm flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving progress...</span>
              </div>
            )}
            {saved && !saving && (
              <div className="text-green-400 text-sm">
                Progress saved! ✓
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              disabled={saving}
              className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              TRY AGAIN
            </button>
            
            {nextLevel ? (
              <button
                onClick={handleNextLevel}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-golf-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 font-game disabled:opacity-50"
              >
                NEXT LEVEL
              </button>
            ) : (
              <button
                onClick={handleLevelSelect}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-golf-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 font-game disabled:opacity-50"
              >
                LEVEL SELECT
              </button>
            )}
          </div>

          {/* Secondary Action */}
          <button
            onClick={handleLevelSelect}
            disabled={saving}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            Back to Levels
          </button>
        </div>
      </div>

      {/* Guest Signup Prompt Modal */}
      {showGuestPrompt && user?.isAnonymous && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4 font-game text-center">
              SAVE YOUR PROGRESS!
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-yellow-400 text-lg mb-2">
                You earned {gameResult.starsEarned} stars!
              </div>
              <div className="text-white/80 text-sm">
                Create an account to sync your progress across devices and never lose your achievements.
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowGuestPrompt(false)}
                className="flex-1 bg-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                MAYBE LATER
              </button>
              <button
                onClick={handleGuestSignup}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-3 px-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-game"
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}