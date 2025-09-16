// Level configuration for Golf3D
// Each level defines the course layout, par, and assets

export const levels = [
  {
    id: 'level_1',
    name: 'Garden Green',
    par: 3,
    difficulty: 'easy',
    previewImage: '/assets/previews/level1.jpg', // Replace with actual preview images
    glbPath: null, // Use procedural terrain - can replace with '/assets/models/level1.glb'
    description: 'A gentle introduction to Golf3D with rolling hills and basic obstacles.',
    // Terrain instructions for procedural generation
    terrain: {
      type: 'slopes',
      width: 30,
      height: 20,
      slopes: [
        { x: 0, z: 0, width: 10, height: 8, elevation: 0.5 }, // Starting area
        { x: 15, z: -5, width: 8, height: 6, elevation: -0.3 }, // Small valley
        { x: 20, z: 5, width: 6, height: 6, elevation: 0.2 }, // Goal area
      ],
      obstacles: [
        { type: 'tree', x: 8, z: -3 },
        { type: 'tree', x: 12, z: 4 },
        { type: 'rock', x: 18, z: -2 }
      ]
    },
    ballStart: { x: -12, y: 2, z: 0 },
    holePosition: { x: 22, y: 0.5, z: 6 },
    holeRadius: 0.8,
    unlocked: true, // First level is always unlocked
    unlockCost: 0
  },
  
  {
    id: 'level_2',
    name: 'Windmill Valley',
    par: 4,
    difficulty: 'medium',
    previewImage: '/assets/previews/level2.jpg',
    glbPath: null, // Use procedural terrain - can replace with '/assets/models/level2.glb'
    description: 'Navigate around the spinning windmill and through narrow passages.',
    terrain: {
      type: 'complex',
      width: 40,
      height: 25,
      slopes: [
        { x: -15, z: 0, width: 8, height: 8, elevation: 1.0 }, // Elevated start
        { x: -5, z: -8, width: 12, height: 6, elevation: 0.0 }, // Valley path
        { x: 8, z: 2, width: 10, height: 8, elevation: 0.5 }, // Windmill area
        { x: 25, z: -5, width: 8, height: 10, elevation: 0.0 }, // Goal area
      ],
      obstacles: [
        { type: 'windmill', x: 10, z: 5 }, // Spinning obstacle
        { type: 'tree', x: 0, z: -12 },
        { type: 'tree', x: 15, z: -8 },
        { type: 'rock', x: 20, z: 2 }
      ]
    },
    ballStart: { x: -18, y: 3, z: 0 },
    holePosition: { x: 28, y: 0.5, z: -2 },
    holeRadius: 0.8,
    unlocked: false,
    unlockCost: 2 // Costs 5 stars to unlock
  },
  
  {
    id: 'level_3',
    name: 'Mountain Peak',
    par: 5,
    difficulty: 'hard',
    previewImage: '/assets/previews/level3.jpg',
    glbPath: null, // Use procedural terrain - can replace with '/assets/models/level3.glb'
    description: 'A challenging mountain course with steep slopes and precise shots required.',
    terrain: {
      type: 'mountain',
      width: 50,
      height: 35,
      slopes: [
        { x: -20, z: 0, width: 8, height: 8, elevation: 2.0 }, // High start
        { x: -8, z: -12, width: 10, height: 8, elevation: 1.0 }, // Mid plateau
        { x: 5, z: 5, width: 12, height: 10, elevation: 0.5 }, // Lower section
        { x: 20, z: -8, width: 8, height: 8, elevation: 3.0 }, // Peak jump
        { x: 35, z: 0, width: 10, height: 10, elevation: 0.0 }, // Final valley
      ],
      obstacles: [
        { type: 'tree', x: -15, z: -8 },
        { type: 'tree', x: -5, z: -15 },
        { type: 'rock', x: 8, z: 12 },
        { type: 'rock', x: 15, z: -2 },
        { type: 'tree', x: 25, z: -12 },
        { type: 'tree', x: 32, z: 8 }
      ]
    },
    ballStart: { x: -24, y: 4, z: 0 },
    holePosition: { x: 38, y: 0.5, z: 2 },
    holeRadius: 0.8,
    unlocked: false,
    unlockCost: 5 // Costs 12 stars to unlock
  }
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