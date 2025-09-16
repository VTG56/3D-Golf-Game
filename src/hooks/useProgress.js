import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase/firebase';
import toast from 'react-hot-toast';

// Storage keys for guest data
const GUEST_STORAGE_KEY = 'golf3d_guest';
const GUEST_ID_KEY = 'golf3d_guestId';

/**
 * Hook to manage user progress for both authenticated users and guests
 * Handles reading/writing progress data and guest->user migration
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
   * @returns {Promise<string>} Guest user ID
   */
  const initializeGuest = async () => {
    try {
      setLoading(true);
      
      // Check if already has guest session
      let guestId = getGuestId();
      if (guestId && auth.currentUser?.isAnonymous && auth.currentUser.uid === guestId) {
        return guestId;
      }

      // Create new anonymous user
      const { user } = await signInAnonymously(auth);
      guestId = user.uid;
      setGuestId(guestId);

      // Initialize empty progress for guest
      const initialProgress = {
        levelStats: {},
        totalStars: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(initialProgress));

      toast.success('Guest session started!');
      return guestId;
    } catch (error) {
      console.error('Error initializing guest:', error);
      toast.error('Failed to start guest session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get progress data for user or guest
   * @param {Object} params
   * @param {string} params.uid - User ID (null for guest)
   * @param {string} params.guestId - Guest ID (null for authenticated user)
   * @returns {Promise<Object>} Progress data
   */
  const getProgress = async ({ uid = null, guestId = null }) => {
    try {
      setLoading(true);

      if (uid) {
        // Get progress from Firestore for authenticated user
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            levelStats: userData.progress?.levelStats || {},
            totalStars: userData.progress?.totalStars || 0,
            gamesPlayed: userData.progress?.gamesPlayed || 0
          };
        } else {
          // Initialize new user progress
          const initialProgress = {
            levelStats: {},
            totalStars: 0,
            gamesPlayed: 0
          };
          await setDoc(doc(db, 'users', uid), {
            progress: initialProgress,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          return initialProgress;
        }
      } else if (guestId) {
        // Get progress from localStorage for guest
        const guestData = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
        if (guestData) {
          return JSON.parse(guestData);
        } else {
          // Initialize new guest progress
          const initialProgress = {
            levelStats: {},
            totalStars: 0,
            gamesPlayed: 0,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(initialProgress));
          return initialProgress;
        }
      }

      throw new Error('No uid or guestId provided');
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set/update progress data for a specific level
   * @param {Object} params
   * @param {string} params.uid - User ID (null for guest)
   * @param {string} params.guestId - Guest ID (null for authenticated user)
   * @param {string} params.levelId - Level identifier
   * @param {number} params.strokes - Number of strokes taken
   * @param {number} params.stars - Stars earned (0-3)
   * @param {number} params.timeTaken - Time taken in seconds
   * @returns {Promise<void>}
   */
  const setProgress = async ({ uid = null, guestId = null, levelId, strokes, stars, timeTaken }) => {
    try {
      setLoading(true);

      if (uid) {
        // Update Firestore for authenticated user using transaction
        await runTransaction(db, async (transaction) => {
          const userDocRef = doc(db, 'users', uid);
          const userDoc = await transaction.get(userDocRef);
          
          let currentData = {};
          if (userDoc.exists()) {
            currentData = userDoc.data();
          }

          const currentProgress = currentData.progress || {
            levelStats: {},
            totalStars: 0,
            gamesPlayed: 0
          };

          const currentLevelStats = currentProgress.levelStats[levelId] || {
            bestStrokes: Infinity,
            bestStars: 0,
            timesPlayed: 0,
            bestTime: Infinity
          };

          // Update level stats - keep best values
          const newLevelStats = {
            ...currentLevelStats,
            bestStrokes: Math.min(currentLevelStats.bestStrokes, strokes),
            bestStars: Math.max(currentLevelStats.bestStars, stars),
            bestTime: timeTaken ? Math.min(currentLevelStats.bestTime, timeTaken) : currentLevelStats.bestTime,
            timesPlayed: currentLevelStats.timesPlayed + 1,
            lastPlayed: new Date().toISOString()
          };

          // Calculate total stars (sum of best stars for each level)
          const newLevelStatsMap = {
            ...currentProgress.levelStats,
            [levelId]: newLevelStats
          };
          const totalStars = Object.values(newLevelStatsMap).reduce((sum, stats) => sum + stats.bestStars, 0);

          // Update the document
          const updatedProgress = {
            levelStats: newLevelStatsMap,
            totalStars,
            gamesPlayed: currentProgress.gamesPlayed + 1
          };

          transaction.set(userDocRef, {
            ...currentData,
            progress: updatedProgress,
            updatedAt: new Date()
          }, { merge: true });
        });

        toast.success(`Progress saved! Earned ${stars} stars`);
      } else if (guestId) {
        // Update localStorage for guest
        const currentData = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
        const currentProgress = currentData ? JSON.parse(currentData) : {
          levelStats: {},
          totalStars: 0,
          gamesPlayed: 0
        };

        const currentLevelStats = currentProgress.levelStats[levelId] || {
          bestStrokes: Infinity,
          bestStars: 0,
          timesPlayed: 0,
          bestTime: Infinity
        };

        // Update level stats - keep best values
        const newLevelStats = {
          ...currentLevelStats,
          bestStrokes: Math.min(currentLevelStats.bestStrokes, strokes),
          bestStars: Math.max(currentLevelStats.bestStars, stars),
          bestTime: timeTaken ? Math.min(currentLevelStats.bestTime, timeTaken) : currentLevelStats.bestTime,
          timesPlayed: currentLevelStats.timesPlayed + 1,
          lastPlayed: new Date().toISOString()
        };

        // Calculate total stars
        const newLevelStatsMap = {
          ...currentProgress.levelStats,
          [levelId]: newLevelStats
        };
        const totalStars = Object.values(newLevelStatsMap).reduce((sum, stats) => sum + stats.bestStars, 0);

        // Save updated progress
        const updatedProgress = {
          ...currentProgress,
          levelStats: newLevelStatsMap,
          totalStars,
          gamesPlayed: currentProgress.gamesPlayed + 1,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`${GUEST_STORAGE_KEY}_${guestId}`, JSON.stringify(updatedProgress));
        toast.success(`Progress saved locally! Earned ${stars} stars`);
      }
    } catch (error) {
      console.error('Error setting progress:', error);
      toast.error('Failed to save progress');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Migrate guest progress to authenticated user account
   * @param {Object} params
   * @param {string} params.guestId - Guest ID to migrate from
   * @param {string} params.uid - User ID to migrate to
   * @returns {Promise<void>}
   */
  const migrateGuestToUser = async ({ guestId, uid }) => {
    try {
      setLoading(true);

      // Get guest progress from localStorage
      const guestData = localStorage.getItem(`${GUEST_STORAGE_KEY}_${guestId}`);
      if (!guestData) {
        console.log('No guest data to migrate');
        return;
      }

      const guestProgress = JSON.parse(guestData);

      // Get current user progress from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentUserProgress = {
        levelStats: {},
        totalStars: 0,
        gamesPlayed: 0
      };

      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentUserProgress = userData.progress || currentUserProgress;
      }

      // Merge progress data - take best values from each
      const mergedLevelStats = { ...currentUserProgress.levelStats };
      
      Object.entries(guestProgress.levelStats).forEach(([levelId, guestStats]) => {
        const userStats = mergedLevelStats[levelId] || {
          bestStrokes: Infinity,
          bestStars: 0,
          timesPlayed: 0,
          bestTime: Infinity
        };

        mergedLevelStats[levelId] = {
          bestStrokes: Math.min(userStats.bestStrokes, guestStats.bestStrokes),
          bestStars: Math.max(userStats.bestStars, guestStats.bestStars),
          bestTime: Math.min(userStats.bestTime, guestStats.bestTime || Infinity),
          timesPlayed: userStats.timesPlayed + guestStats.timesPlayed,
          lastPlayed: [userStats.lastPlayed, guestStats.lastPlayed]
            .filter(Boolean)
            .sort()
            .pop() || new Date().toISOString()
        };
      });

      // Calculate total stars from merged data
      const totalStars = Object.values(mergedLevelStats).reduce((sum, stats) => sum + stats.bestStars, 0);

      // Save merged progress to Firestore
      await setDoc(userDocRef, {
        progress: {
          levelStats: mergedLevelStats,
          totalStars,
          gamesPlayed: currentUserProgress.gamesPlayed + guestProgress.gamesPlayed
        },
        updatedAt: new Date()
      }, { merge: true });

      // Clear guest data from localStorage
      localStorage.removeItem(`${GUEST_STORAGE_KEY}_${guestId}`);
      localStorage.removeItem(GUEST_ID_KEY);

      toast.success('Guest progress successfully migrated to your account!');
    } catch (error) {
      console.error('Error migrating guest to user:', error);
      toast.error('Failed to migrate guest progress');
      throw error;
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