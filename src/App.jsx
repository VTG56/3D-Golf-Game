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

// Component to handle authenticated user redirection
function AuthenticatedRoute({ children }) {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '12px'
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
          
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
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Future Protected Routes (placeholder for now) */}
            <Route 
              path="/play" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                      <h1 className="text-3xl font-bold text-white mb-4 font-game">COMING SOON</h1>
                      <p className="text-white/80">Golf gameplay will be available here!</p>
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