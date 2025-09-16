import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThreeScene from './ThreeScene';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInAsGuest } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);

  // Handle play as guest
  const handlePlayAsGuest = async () => {
    try {
      setGuestLoading(true);
      await signInAsGuest();
      navigate('/levels');
    } catch (error) {
      console.error('Guest sign in failed:', error);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-auto bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* 3D Background */}
      <div className="fixed inset-0 h-full w-full">
        <ThreeScene className="w-full h-full" />
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Logo and Title */}
        <div className="text-center mb-8 lg:mt-20 animate-float">
          <div className="mb-6">
            {/* Game Logo - using CSS to create a blocky golf-themed design */}
            <div className="inline-block relative">
              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[5rem] px-6 sm:px-12 py-4 font-black text-black drop-shadow-2xl bg-gradient-to-r from-golf-green-500 to-emerald-500 transform group-hover:scale-105 transition-transform duration-300 rounded-2xl   font-game tracking-wider transform hover:scale-105 transition-transform duration-300">
                GOLF
                <span className="text-golf-black-5">3D</span>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full animate-bounce delay-75"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-golf-green-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold drop-shadow-lg mb-2 font-game">
            MINIGOLF REVAMPED
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/90 drop-shadow-md font-medium">
            Experience the ultimate 3D minigolf adventure
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6 text-center">
          {/* Main Play Button */}
          <Link
            to="/login"
            className="inline-block group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-golf-green-500 to-emerald-500 transform group-hover:scale-105 transition-transform duration-300 rounded-2xl blur-sm opacity-75"></div>
            <div className="relative bg-white/10 backdrop-blur-md border font-game rounded-xl border-white/20  px-16 py-4 text-lg sm:text-xl md:text-2xl font-bold text-white shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <span className="flex items-center justify-center space-x-3">
                <span>⛳</span>
                <span>PLAY NOW</span>
                <span>🌍</span>
              </span>
            </div>
          </Link>
          
          {/* Guest Play Button */}
          <div className="space-y-3">
            <button
              onClick={handlePlayAsGuest}
              disabled={guestLoading}
              className="block w-full max-w-md mx-auto group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform group-hover:scale-105 transition-transform duration-300 rounded-xl blur-sm opacity-60"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-xl font-game text-lg md:text-xl font-semibold text-white shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
                {guestLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Starting Guest Session...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>PLAY AS GUEST</span>
                  </span>
                )}
              </div>
            </button>
            
            
          </div>
          
          <p className="text-white/80 font-game text-sm md:text-base font-medium">
            Join and compete with other players worldwide!
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mt-6 flex flex-wrap font-game justify-center gap-2 sm:gap-4 max-w-[90%] sm:max-w-2xl">

          {[
            "🎮 Physics-Based Gameplay",
            "🏆 Global Leaderboards", 
            "🌐 Multiplayer Tournaments",
            "📱 Cross-Platform Play"
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col  sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm sm:text-base md:text-lg">
          <Link
            to="/login"
            className="text-white/80 font-game px-10 py-3 hover:text-white bg-gradient-to-r from-blue-500 to-purple-500 transform group-hover:scale-105 transition-transform duration-300 rounded-xl  font-medium text-lg transition-colors duration-200 hover:underline underline-offset-4 hover:scale-125"
          >
            Login
          </Link>
          <span className="text-white/50">or</span>
          <Link
            to="/signup"
            className="text-white/80 font-game px-8 py-3 hover:text-white bg-gradient-to-r from-blue-500 to-purple-500 transform group-hover:scale-105 transition-transform duration-300 rounded-xl  font-medium text-lg transition-colors duration-200 hover:underline underline-offset-4 hover:scale-125"
          >
            Sign Up
          </Link>
        
        </div>
        <footer className="mt-10 pb-5 sm:pb-2 md:pb-3 w-full text-center text-xs sm:text-sm text-white/70 font-game">
  © CloneFest 2025 — All rights reserved ⛳
</footer>
        
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-white rounded-full animate-bounce delay-300 opacity-60"></div>
      <div className="absolute top-32 right-16 w-3 h-3 bg-golf-green-300 rounded-full animate-bounce delay-500 opacity-70"></div>
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-white rounded-full animate-bounce delay-700 opacity-50"></div>
      <div className="absolute bottom-40 right-12 w-6 h-6 bg-golf-green-400 rounded-full animate-bounce delay-1000 opacity-60"></div>
      
      {/* Mobile optimization overlay */}
      
    </div>
  );
}