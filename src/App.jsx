import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Game Pages
import LevelSelect from './pages/LevelSelect';
import Game from './pages/Game';

// Component to handle authenticated user redirection
function AuthenticatedRoute({ children }) {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user && !user.isAnonymous) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Component to handle guest-accessible routes
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-medium text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Allow access for both authenticated users and guests (including anonymous)
  return children;
}
const toasterStyle = `
  .golf-toast {
    animation: toast-enter 0.5s ease-out;
  }

  @keyframes toast-enter {
    0% {
      transform: scale(0.8) translateY(-20px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Inject the CSS styles directly into the document head */}
      <style>{toasterStyle}</style>

      {/* --- The Toaster Component --- */}
      <Toaster 
        position="top-center"
        toastOptions={{
          // Add a className to target the toast with our CSS animation
          className: 'golf-toast', 
          
          duration: 4000,
          
          // Default style for all toasts
          style: {
            background: '#15803d', // A nice, deep golf green
            color: '#ffffff',
            border: '2px solid #fde047', // A gold/yellow border
            borderRadius: '50px', // Pill shape, looks more like a game UI
            padding: '12px 20px',
            fontFamily: 'font-game', // Your custom game font
            fontSize: '16px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)', // A prominent shadow
          },

          // --- Custom options for specific toast types ---
          success: {
            icon: '⛳️', // Use a golf emoji for success!
            style: {
              background: '#16a34a', // A slightly brighter green for success
            },
          },

          error: {
            icon: '😟', // Use a water hazard/warning emoji for errors
            style: {
              background: '#dc2626', // A strong red for errors
              borderColor: '#fef2f2', // A light border for contrast
            },
          },
        }}
      />
      {/* --- End of Toaster Component --- */}
          
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <AuthenticatedRoute>
                  <LandingPage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthenticatedRoute>
                  <Login />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthenticatedRoute>
                  <Signup />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <AuthenticatedRoute>
                  <ForgotPassword />
                </AuthenticatedRoute>
              } 
            />
            
            {/* Protected Routes (Authenticated Users Only) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Game Routes (Accessible to both authenticated users and guests) */}
            <Route 
              path="/levels" 
              element={
                <GuestRoute>
                  <LevelSelect />
                </GuestRoute>
              } 
            />
            <Route 
              path="/game/:levelId" 
              element={
                <GuestRoute>
                  <Game />
                </GuestRoute>
              } 
            />
            
            {/* Legacy Protected Routes (placeholder for now) */}
            <Route 
              path="/play" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                      <h1 className="text-3xl font-bold text-white mb-4 font-game">REDIRECTING...</h1>
                      <p className="text-white/80">Taking you to level select...</p>
                      <button 
                        onClick={() => window.location.href = '/levels'}
                        className="mt-4 bg-golf-green-500 text-white px-6 py-2 rounded-lg hover:bg-golf-green-600 transition-colors"
                      >
                        Go to Levels
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                      <h1 className="text-3xl font-bold text-white mb-4 font-game">LEADERBOARD</h1>
                      <p className="text-white/80">Global rankings coming soon!</p>
                      <button 
                        onClick={() => window.history.back()}
                        className="mt-4 bg-golf-green-500 text-white px-6 py-2 rounded-lg hover:bg-golf-green-600 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tournaments" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                      <h1 className="text-3xl font-bold text-white mb-4 font-game">TOURNAMENTS</h1>
                      <p className="text-white/80">Competitive tournaments coming soon!</p>
                      <button 
                        onClick={() => window.history.back()}
                        className="mt-4 bg-golf-green-500 text-white px-6 py-2 rounded-lg hover:bg-golf-green-600 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route path="/game/:levelId" element={<Game />} />

            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4 font-game">PAGE NOT FOUND</h2>
                    <p className="text-white/80 mb-6">The page you're looking for doesn't exist.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="bg-golf-green-500 text-white px-6 py-3 rounded-lg hover:bg-golf-green-600 transition-colors font-game"
                    >
                      GO HOME
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;