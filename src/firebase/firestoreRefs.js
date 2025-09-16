import { collection, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { FIRESTORE_PATHS, FIRESTORE_FIELDS } from './firestorePaths.js';

// Collection references
export const usersRef = collection(db, FIRESTORE_PATHS.USERS);
export const gamesRef = collection(db, FIRESTORE_PATHS.GAMES);
export const coursesRef = collection(db, FIRESTORE_PATHS.COURSES);
export const leaderboardsRef = collection(db, FIRESTORE_PATHS.LEADERBOARDS);
export const tournamentsRef = collection(db, FIRESTORE_PATHS.TOURNAMENTS);

// Document reference helpers
export const userDocRef = (userId) => doc(db, FIRESTORE_PATHS.USER(userId));
export const gameDocRef = (gameId) => doc(db, FIRESTORE_PATHS.GAME(gameId));
export const courseDocRef = (courseId) => doc(db, FIRESTORE_PATHS.COURSE(courseId));
export const leaderboardDocRef = (courseId) => doc(db, FIRESTORE_PATHS.LEADERBOARD(courseId));

// User-specific collection references
export const userGamesRef = (userId) => collection(db, FIRESTORE_PATHS.USER_GAMES(userId));
export const userFriendsRef = (userId) => collection(db, FIRESTORE_PATHS.USER_FRIENDS(userId));
export const userMessagesRef = (userId) => collection(db, FIRESTORE_PATHS.USER_MESSAGES(userId));

// Common query builders
export const getUserByEmail = (email) => {
  return query(
    usersRef,
    where(FIRESTORE_FIELDS.EMAIL, '==', email),
    limit(1)
  );
};

export const getUserGames = (userId, limitCount = 10) => {
  return query(
    userGamesRef(userId),
    orderBy(FIRESTORE_FIELDS.COMPLETED_AT, 'desc'),
    limit(limitCount)
  );
};

export const getLeaderboard = (courseId, limitCount = 10) => {
  return query(
    collection(db, FIRESTORE_PATHS.LEADERBOARD(courseId)),
    orderBy(FIRESTORE_FIELDS.BEST_SCORE, 'asc'),
    limit(limitCount)
  );
};

export const getRecentGames = (limitCount = 20) => {
  return query(
    gamesRef,
    where(FIRESTORE_FIELDS.IS_COMPLETED, '==', true),
    orderBy(FIRESTORE_FIELDS.COMPLETED_AT, 'desc'),
    limit(limitCount)
  );
};

export const getActiveTournaments = () => {
  return query(
    tournamentsRef,
    where(FIRESTORE_FIELDS.STATUS, '==', 'active'),
    orderBy(FIRESTORE_FIELDS.CREATED_AT, 'desc')
  );
};

export const getUserFriends = (userId) => {
  return query(
    userFriendsRef(userId),
    where(FIRESTORE_FIELDS.STATUS, '==', 'accepted'),
    orderBy(FIRESTORE_FIELDS.CREATED_AT, 'desc')
  );
};

// Utility functions for creating documents
export const createUserData = (user) => ({
  [FIRESTORE_FIELDS.EMAIL]: user.email,
  [FIRESTORE_FIELDS.DISPLAY_NAME]: user.displayName || user.email.split('@')[0],
  [FIRESTORE_FIELDS.PHOTO_URL]: user.photoURL || null,
  [FIRESTORE_FIELDS.CREATED_AT]: new Date(),
  [FIRESTORE_FIELDS.UPDATED_AT]: new Date(),
  [FIRESTORE_FIELDS.LAST_LOGIN]: new Date(),
  [FIRESTORE_FIELDS.IS_ONLINE]: true,
});

export const createGameData = (userId, courseId) => ({
  [FIRESTORE_FIELDS.USER_ID]: userId,
  [FIRESTORE_FIELDS.COURSE_ID]: courseId,
  [FIRESTORE_FIELDS.SCORE]: 0,
  [FIRESTORE_FIELDS.STROKES]: 0,
  [FIRESTORE_FIELDS.STARTED_AT]: new Date(),
  [FIRESTORE_FIELDS.IS_COMPLETED]: false,
  [FIRESTORE_FIELDS.CREATED_AT]: new Date(),
});

export const updateGameCompletion = (score, strokes) => ({
  [FIRESTORE_FIELDS.SCORE]: score,
  [FIRESTORE_FIELDS.STROKES]: strokes,
  [FIRESTORE_FIELDS.COMPLETED_AT]: new Date(),
  [FIRESTORE_FIELDS.IS_COMPLETED]: true,
  [FIRESTORE_FIELDS.UPDATED_AT]: new Date(),
});