// src/components/EndOfRound.jsx
import React from "react";

export default function EndOfRound({ strokes, starsEarned, timeTaken, par, onNextLevel, onBackToLevels }) {
  // Render stars (★ = filled, ☆ = empty)
  const renderStars = () => {
    return [1, 2, 3].map((i) => (
      <span key={i} className={i <= starsEarned ? "text-yellow-400 text-3xl" : "text-gray-600 text-3xl"}>
        ★
      </span>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-700 to-green-900 text-white">
      <h1 className="text-4xl font-bold font-game mb-4">Round Completed !</h1>

      <div className="flex gap-2 mb-6">{renderStars()}</div>

      <div className="bg-black/40 font-game p-6 rounded-lg mb-6 text-center">
        <p className="mb-2">Par: {par}</p>
        <p className="mb-2">Strokes: {strokes}</p>
        <p className="mb-2">Time Taken: {timeTaken}s</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBackToLevels}
          className="px-6 py-3 bg-blue-600 font-game hover:bg-blue-700 rounded-lg text-lg font-semibold"
        >
          Back to Levels
        </button>

        <button
          onClick={onNextLevel}
          className="px-6 py-3 bg-yellow-600 font-game hover:bg-yellow-600 rounded-lg text-lg font-semibold"
        >
          Next Level ▶
        </button>
      </div>
    </div>
  );
}
