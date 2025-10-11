// src/hooks/useProgress.js
import { useState } from 'react';
import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase/firebase';
import toast from 'react-hot-toast';

// Storage keys for guest data
const GUEST_STORAGE_KEY = 'golf3d_guest';
const GUEST_ID_KEY = 'golf3d_guestId';

/**
 * Hook to manage user progress for both authenticated users and guests
 */
export function useProgress() {
  const [loading, setLoading] = useState(false);

  // Get current guest ID from localStorage
  const getGuestId = () => {
    return localStorage.getItem(GUEST_ID_KEY);
  };

  // Set guest ID in localStorage
  const setGuestId = (guestId) => {
    localStorage.setItem(GUEST_ID_KEY, guestId);
  };

  /**
   * Initialize guest session with anonymous authentication
   * @returns {Promise<string>} guestId
   */
  const initializeGuest = async () => {
    try {
      setLoading(true);

      // If guestId exists and auth currentUser matches return it
      let guestId = getGuestId();
      if (guestId && auth.currentUser?.isAnonymous && auth.currentUser.uid === guestId) {
        return guestId;
      }

      // create anonymous user
      const { user } = await signInAnonymously(auth);
      guestId = user.uid;
      setGuestId(guestId);

      // initialize progress for guest
      const initialProgress = {
        levelStats: {},
        totalStars: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(initialProgress));

      toast.success('Guest session started!');
      return guestId;
    } catch (err) {
      console.error('Error initializing guest:', err);
      toast.error('Failed to start guest session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get progress for uid (auth user) or guestId (guest)
   * returns object: { levelStats, totalStars, gamesPlayed }
   */
  const getProgress = async ({ uid = null, guestId = null }) => {
    try {
      setLoading(true);

      if (uid) {
        // Authenticated user - read from Firestore
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            levelStats: data.progress?.levelStats || {},
            totalStars: data.progress?.totalStars || 0,
            gamesPlayed: data.progress?.gamesPlayed || 0
          };
        } else {
          // Initialize progress for user
          const initialProgress = { levelStats: {}, totalStars: 0, gamesPlayed: 0 };
          await setDoc(userDocRef, { progress: initialProgress, createdAt: new Date(), updatedAt: new Date() }, { merge: true });
          return initialProgress;
        }
      } else if (guestId) {
        const raw = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
        if (raw) {
          return JSON.parse(raw);
        } else {
          const initialProgress = { levelStats: {}, totalStars: 0, gamesPlayed: 0, createdAt: new Date().toISOString() };
          localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(initialProgress));
          return initialProgress;
        }
      }

      throw new Error('No uid or guestId provided to getProgress');
    } catch (err) {
      console.error('Error getting progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set / update progress for a level.
   * Returns the updated progress object so callers can use it immediately.
   */
  const setProgress = async ({ uid = null, guestId = null, levelId, strokes = 0, stars = 0, timeTaken = null }) => {
    try {
      setLoading(true);

      if (uid) {
        // Authenticated user - use transaction
        let finalProgress = null;
        await runTransaction(db, async (tx) => {
          const userDocRef = doc(db, 'users', uid);
          const userDoc = await tx.get(userDocRef);

          let currentData = {};
          if (userDoc.exists()) currentData = userDoc.data();

          const currentProgress = currentData.progress || { levelStats: {}, totalStars: 0, gamesPlayed: 0 };
          const currentLevelStats = currentProgress.levelStats?.[levelId] || { bestStrokes: Infinity, bestStars: 0, timesPlayed: 0, bestTime: Infinity };

          const newLevelStats = {
            ...currentLevelStats,
            bestStrokes: Math.min(currentLevelStats.bestStrokes || Infinity, strokes),
            bestStars: Math.max(currentLevelStats.bestStars || 0, stars),
            bestTime: timeTaken != null ? Math.min(currentLevelStats.bestTime || Infinity, timeTaken) : currentLevelStats.bestTime,
            timesPlayed: (currentLevelStats.timesPlayed || 0) + 1,
            lastPlayed: new Date().toISOString()
          };

          const newLevelStatsMap = {
            ...(currentProgress.levelStats || {}),
            [levelId]: newLevelStats
          };

          const totalStars = Object.values(newLevelStatsMap).reduce((sum, s) => sum + (s.bestStars || 0), 0);

          const updatedProgress = {
            levelStats: newLevelStatsMap,
            totalStars,
            gamesPlayed: (currentProgress.gamesPlayed || 0) + 1
          };

          // Write back
          tx.set(userDocRef, {
            ...currentData,
            progress: updatedProgress,
            updatedAt: new Date()
          }, { merge: true });

          finalProgress = updatedProgress;
        });

        toast.success(`Progress saved! Earned ${stars} stars`);
        return finalProgress;
      } else if (guestId) {
        // Guest localStorage
        const raw = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
        const currentProgress = raw ? JSON.parse(raw) : { levelStats: {}, totalStars: 0, gamesPlayed: 0 };

        const currentLevelStats = currentProgress.levelStats?.[levelId] || { bestStrokes: Infinity, bestStars: 0, timesPlayed: 0, bestTime: Infinity };

        const newLevelStats = {
          ...currentLevelStats,
          bestStrokes: Math.min(currentLevelStats.bestStrokes || Infinity, strokes),
          bestStars: Math.max(currentLevelStats.bestStars || 0, stars),
          bestTime: timeTaken != null ? Math.min(currentLevelStats.bestTime || Infinity, timeTaken) : currentLevelStats.bestTime,
          timesPlayed: (currentLevelStats.timesPlayed || 0) + 1,
          lastPlayed: new Date().toISOString()
        };

        const newLevelStatsMap = {
          ...(currentProgress.levelStats || {}),
          [levelId]: newLevelStats
        };

        const totalStars = Object.values(newLevelStatsMap).reduce((sum, s) => sum + (s.bestStars || 0), 0);

        const updatedProgress = {
          ...currentProgress,
          levelStats: newLevelStatsMap,
          totalStars,
          gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(updatedProgress));
        toast.success(`Progress saved locally! Earned ${stars} stars`);
        return updatedProgress;
      } else {
        throw new Error('No uid or guestId passed to setProgress');
      }
    } catch (err) {
      console.error('Error setting progress:', err);
      toast.error('Failed to save progress');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Migrate guest progress into authenticated user account (merge best stats)
   */
  const migrateGuestToUser = async ({ guestId, uid }) => {
    try {
      setLoading(true);

      const raw = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
      if (!raw) {
        console.log('No guest data to migrate');
        return;
      }
      const guestProgress = JSON.parse(raw);

      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      let currentUserProgress = { levelStats: {}, totalStars: 0, gamesPlayed: 0 };
      if (userDoc.exists()) {
        currentUserProgress = userDoc.data().progress || currentUserProgress;
      }

      // Merge by taking best values
      const mergedLevelStats = { ...(currentUserProgress.levelStats || {}) };

      Object.entries(guestProgress.levelStats || {}).forEach(([lvl, guestStats]) => {
        const userStats = mergedLevelStats[lvl] || { bestStrokes: Infinity, bestStars: 0, timesPlayed: 0, bestTime: Infinity };
        mergedLevelStats[lvl] = {
          bestStrokes: Math.min(userStats.bestStrokes || Infinity, guestStats.bestStrokes || Infinity),
          bestStars: Math.max(userStats.bestStars || 0, guestStats.bestStars || 0),
          bestTime: Math.min(userStats.bestTime || Infinity, guestStats.bestTime || Infinity),
          timesPlayed: (userStats.timesPlayed || 0) + (guestStats.timesPlayed || 0),
          lastPlayed: [userStats.lastPlayed, guestStats.lastPlayed].filter(Boolean).sort().pop() || new Date().toISOString()
        };
      });

      const totalStars = Object.values(mergedLevelStats).reduce((sum, s) => sum + (s.bestStars || 0), 0);

      await setDoc(userDocRef, {
        progress: {
          levelStats: mergedLevelStats,
          totalStars,
          gamesPlayed: (currentUserProgress.gamesPlayed || 0) + (guestProgress.gamesPlayed || 0)
        },
        updatedAt: new Date()
      }, { merge: true });

      // clear guest
      localStorage.removeItem(`${GUEST_STORAGE_KEY}_${guestId}`);
      localStorage.removeItem(GUEST_ID_KEY);

      toast.success('Guest progress migrated to account');
    } catch (err) {
      console.error('Error migrating guest to user:', err);
      toast.error('Failed to migrate progress');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getProgress,
    setProgress,
    initializeGuest,
    migrateGuestToUser,
    getGuestId
  };
}
