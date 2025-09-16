import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
        // Update local user state
        setUser({ ...user, displayName });
      }
      
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      let message = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      
      toast.error(message);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return user;
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Failed to log in';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later';
      }
      
      toast.error(message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google!');
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      let message = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked. Please allow popups and try again';
      }
      
      toast.error(message);
      throw error;
    }
  };

  // Sign in as guest (anonymous)
  const signInAsGuest = async () => {
    try {
      const { user } = await signInAnonymously(auth);
      toast.success('Playing as guest!');
      return user;
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      toast.error('Failed to start guest session');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}