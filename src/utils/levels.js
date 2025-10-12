// Level configuration for Golf3D
// Each level defines the course layout, par, and assets

export const levels = [
  {
    id: 1,
    name: "Straight Lane",
    description: "A simple straight lane with a gentle slope and a wooden plank obstacle.",
    par: 10,
    starsRequired: 0,
    ballStart: { x: -10, y: 0.15, z: 0 },
    holePosition: { x: 15, y: 0, z: 0 },
    holeRadius: 0.3,
    unlockCost: 0,
    difficulty: "easy",
    terrain: {
      width: 40,
      height: 15,
  
      // Add slope data for slight incline
      slopes: [
        { x: 0, y: 0, z: 0, width: 10, height: 10, elevation: 5 }  // gentle upward slope in center
      ],
  
      obstacles: [
        { type: "tree", x: 8, z: -3, scale: 5 },
        // removed the rock here
        {
          type: "barrier",
          x: 4,           // horizontal position
          z: -1,          // depth position
          width: 5,       // how wide the barrier is
          height: 0.5,    // how tall it is
          thickness: 0.2, // how thick it is
          rotation: [0, Math.PI / 2, 0] // optional rotation in radians
        },
        { type: "tree", x: 6, z: 2, scale: 3 },
      ],
    },
  },
  
  {
    id: 2,
    name: "Bridge Madness",
    description: "Cross two raised platforms with a gap and reach the hole!",
    par: 15,
    starsRequired: 3,
    ballStart: { x: -12, y: 0.15, z: 0 },
    holePosition: { x: 12, y: 0, z: 0 },
    holeRadius: 0.3,
    unlockCost: 3,
    difficulty: "medium",
    terrain: {
      width: 28,
      height: 14,
      obstacles: [
        { type: "rock", x: 5, z: 3, scale: 2 },  // rock in the middle gap
        { type: "rock", x: 3, z: 5, scale: 2 },  // rock in the middle gap
        { type: "rock", x: 0, z: 1, scale: 5 },  // rock in the middle gap
        { type: "tree", x: 8, z: 0, scale: 5 },
        { type: "tree", x: -4, z: -5, scale: 5 },
        {
          type: "windmill",
          x: 0,
          z: 2,
          bladeLength: 2,
          bladeWidth: 0.2,
          height: 3,
          speed: 1.5 // radians per second
        }, 
        { type: "rock", x: 2, z: -3.8, scale: 2 },
        
        // { type: "barrier", x: 4, z: -1, width: 5, height: 0.5, thickness: 0.2, rotation: [0, Math.PI / 3, 0] },
        { type: "barrel", x: 5, z: -1, scale: 1 },
        { type: "sand", x: -8, z: 0, width: 2, depth: 4 }
      ]
    }
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