import { useState } from 'react';

/**
 * LevelCard Component - Displays individual level information in the level select screen
 * Shows preview, stars, lock status, and unlock options
 */
export default function LevelCard({ 
  level, 
  playerStats, 
  isUnlocked, 
  playerTotalStars,
  onPlay, 
  onUnlock 
}) {
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  // Get player's best performance for this level
  const levelStats = playerStats?.levelStats?.[level.id] || {
    bestStars: 0,
    bestStrokes: null,
    timesPlayed: 0
  };

  // Render star icons based on earned stars
  const renderStars = (earned, total = 3) => {
    return (
      <div className="flex space-x-1">
        {[...Array(total)].map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 font-game flex items-center justify-center ${
              i < earned 
                ? 'text-yellow-400' 
                : 'text-white/30'
            }`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  // Handle play button click
  const handlePlay = () => {
    if (isUnlocked) {
      onPlay(level.id);
    }
  };

  // Handle unlock button click
  const handleUnlock = () => {
    if (playerTotalStars >= level.unlockCost) {
      onUnlock(level.id);
      setShowUnlockConfirm(false);
    }
  };

  return (
    <div className="relative group">
      {/* Main Card */}
      <div className={`
        bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden
        shadow-2xl transition-all duration-300 hover:bg-white/15
        ${isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-75'}
      `}>
        {/* Preview Image Area */}
        <div className="relative h-40 bg-gradient-to-br from-golf-green-400 to-emerald-600 overflow-hidden">
          {/* Placeholder for preview image */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-golf-green-500 to-emerald-700">
            <div className="text-white font-game text-center">
              <div className="text-4xl mb-2">🏌️</div>
              <div className="text-sm font-medium">{level.name}</div>
            </div>
          </div>
          
          {/* Level Info Overlay */}
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="text-white font-game text-sm font-medium">Par {level.par}</div>
          </div>

          {/* Difficulty Badge */}
          <div className={`
            absolute top-3 font-game right-3 px-2 py-1 rounded-lg text-xs font-medium
            ${level.difficulty === 'easy' ? 'bg-green-500/80 text-white' : ''}
            ${level.difficulty === 'medium' ? 'bg-yellow-500/80 text-white' : ''}
            ${level.difficulty === 'hard' ? 'bg-red-500/80 text-white' : ''}
          `}>
            {level.difficulty.toUpperCase()}
          </div>

          {/* Lock Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-sm font-medium">
                  {level.unlockCost} stars to unlock
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Level Name */}
          <h3 className="text-xl font-bold text-white mb-2 font-game">
            {level.name}
          </h3>

          {/* Description */}
          <p className="text-white font-game text-sm mb-4 line-clamp-2">
            {level.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4">
            {/* Stars */}
            <div className="flex items-center space-x-2">
              <span className="text-yellow-200 font-game text-md">Stars:</span>
              {renderStars(levelStats.bestStars)}
            </div>

            {/* Best Score */}
            <div className="text-white font-game text-md">
              {levelStats.bestStrokes ? (
                <span>Best: {levelStats.bestStrokes}</span>
              ) : (
                <span>Not played</span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex space-x-2">
            {isUnlocked ? (
              <button
                onClick={handlePlay}
                className="flex-1 bg-gradient-to-r from-golf-green-700 to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-golf-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 font-game"
              >
                {levelStats.timesPlayed > 0 ? 'PLAY AGAIN' : 'PLAY'}
              </button>
            ) : (
              <button
                onClick={() => setShowUnlockConfirm(true)}
                disabled={playerTotalStars < level.unlockCost}
                className={`
                  flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 font-game
                  ${playerTotalStars >= level.unlockCost
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }
                `}
              >
                {playerTotalStars >= level.unlockCost ? 'UNLOCK' : 'LOCKED'}
              </button>
            )}
          </div>

          {/* Times Played */}
          {levelStats.timesPlayed > 0 && (
            <div className="mt-2 text-center text-white/60 text-xs">
              Played {levelStats.timesPlayed} time{levelStats.timesPlayed !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Unlock Confirmation Modal */}
      {showUnlockConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4 font-game text-center">
              UNLOCK LEVEL?
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-white/90 mb-2">
                <strong>{level.name}</strong>
              </div>
              <div className="text-white/80 text-sm mb-4">
                {level.description}
              </div>
              <div className="text-yellow-400 text-lg font-medium">
                Cost: {level.unlockCost} stars
              </div>
              <div className="text-white/70 text-sm">
                You have: {playerTotalStars} stars
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUnlockConfirm(false)}
                className="flex-1 bg-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                CANCEL
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 bg-yellow-500  text-black font-semibold py-3 px-4 rounded-xl hover:bg-yellow-600 transition-all duration-300 font-game"
              >
                UNLOCK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glow effect for unlockable levels */}
      {!isUnlocked && playerTotalStars >= level.unlockCost && (
        <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}