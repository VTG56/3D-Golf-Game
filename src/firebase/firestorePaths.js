// Firestore collection and document paths
export const FIRESTORE_PATHS = {
  // Users collection
  USERS: 'users',
  USER: (userId) => `users/${userId}`,
  
  // Game data collections
  GAMES: 'games',
  GAME: (gameId) => `games/${gameId}`,
  
  // User game history
  USER_GAMES: (userId) => `users/${userId}/games`,
  USER_GAME: (userId, gameId) => `users/${userId}/games/${gameId}`,
  
  // Leaderboards
  LEADERBOARDS: 'leaderboards',
  LEADERBOARD: (courseId) => `leaderboards/${courseId}`,
  
  // Course data
  COURSES: 'courses',
  COURSE: (courseId) => `courses/${courseId}`,
  
  // Tournament data
  TOURNAMENTS: 'tournaments',
  TOURNAMENT: (tournamentId) => `tournaments/${tournamentId}`,
  TOURNAMENT_PARTICIPANTS: (tournamentId) => `tournaments/${tournamentId}/participants`,
  
  // User settings
  USER_SETTINGS: (userId) => `users/${userId}/settings`,
  
  // Friend system
  USER_FRIENDS: (userId) => `users/${userId}/friends`,
  USER_FRIEND: (userId, friendId) => `users/${userId}/friends/${friendId}`,
  
  // Chat/Messages
  MESSAGES: 'messages',
  USER_MESSAGES: (userId) => `users/${userId}/messages`,
};

// Firestore field names (to avoid typos)
export const FIRESTORE_FIELDS = {
  // User fields
  EMAIL: 'email',
  DISPLAY_NAME: 'displayName',
  PHOTO_URL: 'photoURL',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  LAST_LOGIN: 'lastLogin',
  IS_ONLINE: 'isOnline',
  
  // Game fields
  SCORE: 'score',
  STROKES: 'strokes',
  COURSE_ID: 'courseId',
  STARTED_AT: 'startedAt',
  COMPLETED_AT: 'completedAt',
  IS_COMPLETED: 'isCompleted',
  
  // Leaderboard fields
  USER_ID: 'userId',
  BEST_SCORE: 'bestScore',
  TOTAL_GAMES: 'totalGames',
  RANK: 'rank',
  
  // Common fields
  ID: 'id',
  TIMESTAMP: 'timestamp',
  STATUS: 'status'
};