// Level configuration for Golf3D
// Each level defines the course layout, par, and assets

export const levels = [
  {
    id: 1,
    name: "Straight Shot",
    description: "A simple straight fairway. Just aim and putt!",
    par: 9,
    starsRequired: 0,
    ballStart: { x: -8, y: 0.25, z: 0 },
    holePosition: { x: 8, y: 0.2, z: 0 },
    holeRadius: 0.5,
    unlockCost: 0,
    difficulty: "easy",
    terrain: {
      width: 20,
      height: 10,
      slopes: [], // flat ground
      obstacles: [] // no trees/rocks
    },
  },
  {
    id: 2,
    name: "Gentle Curve",
    description: "The fairway bends around a tree. Plan your angle!",
    par: 10,
    starsRequired: 2,
    ballStart: { x: -8, y: 0.2, z: -2 },
    holePosition: { x: 8, y: 0.2, z: 2 },
    holeRadius: 0.5,
    unlockCost: 2,
    difficulty: "medium",
    terrain: {
      width: 22,
      height: 12,
      slopes: [
        { x: 0, z: 0, width: 6, height: 4, elevation: 0.6 }, // a slight slope bend
      ],
      obstacles: [
        { type: "tree", x: 0, z: 0, scale: 1 }
      ]
    },
  },
  {
    id: 10,
    name: "Twisty Challenge",
    description: "A winding path with obstacles. Accuracy is key!",
    par: 5,
    starsRequired: 5,
    ballStart: { x: -9, y: 0.2, z: 0 },
    holePosition: { x: 9, y: 0.2, z: 0 },
    holeRadius: 0.5,
    unlockCost: 5,
    difficulty: "hard",
    terrain: {
      width: 26,
      height: 14,
      slopes: [
        { x: -4, z: 0, width: 5, height: 4, elevation: 1.2 },
        { x: 3, z: 2, width: 5, height: 3, elevation: -1 },
      ],
      obstacles: [
        { type: "tree", x: -2, z: 1, scale: 1.2 },
        { type: "rock", x: 4, z: -2, scale: 0.8 },
        { type: "tree", x: 6, z: 2, scale: 1 }
      ]
    },
  },
];

// Star calculation rules based on strokes vs par
export const calculateStars = (strokes, par) => {
  if (strokes <= par - 2) return 3; // Eagle or better
  if (strokes <= par - 1) return 2; // Birdie
  if (strokes <= par + 1) return 1; // Par or bogey
  return 0; // Double bogey or worse
};

// Get level by ID
export const getLevelById = (levelId) => {
  return levels.find(level => level.id === levelId);
};

// Get next level in sequence
export const getNextLevel = (currentLevelId) => {
  const currentIndex = levels.findIndex(level => level.id === currentLevelId);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
};

// Calculate total stars available
export const getTotalStarsAvailable = () => {
  return levels.length * 3; // 3 stars per level
};

export default levels;