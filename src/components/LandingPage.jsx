import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <ThreeScene className="w-full h-full" />
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-float">
          <div className="mb-6">
            {/* Game Logo - using CSS to create a blocky golf-themed design */}
            <div className="inline-block relative">
              <div className="text-8xl md:text-9xl lg:text-[9rem] font-black text-black drop-shadow-2xl  font-game tracking-wider transform hover:scale-105 transition-transform duration-300">
                GOLF
                <span className="text-golf-black-5">3D</span>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full animate-bounce delay-75"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-golf-green-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold drop-shadow-lg mb-2 font-game">
            MINIGOLF REVAMPED
          </p>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md font-medium">
            Experience the ultimate 3D minigolf adventure
          </p>
        </div>

        {/* Main CTA Button */}
        <div className="space-y-4 text-center">
          <Link
            to="/login"
            className="inline-block group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-golf-green-500 to-emerald-500 transform group-hover:scale-105 transition-transform duration-300 rounded-2xl blur-sm opacity-75"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 px-12 py-6 rounded-2xl font-game text-2xl md:text-3xl font-bold text-white shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <span className="flex items-center justify-center space-x-3">
                <span>⛳</span>
                <span>PLAY NOW</span>
                <span>🏌️</span>
              </span>
            </div>
          </Link>
          
          <p className="text-white/80 text-sm md:text-base font-medium">
            Join and compete with other players !
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mt-3 flex flex-wrap justify-center gap-4 max-w-2xl">
          {[
            "🎮 Physics-Based Gameplay",
            "🏆 Global Leaderboards", 
            "🌍 Multiplayer Tournaments",
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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <Link
            to="/login"
            className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 hover:underline underline-offset-4"
          >
            Login
          </Link>
          <span className="text-white/50">|</span>
          <Link
            to="/signup"
            className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 hover:underline underline-offset-4"
          >
            Sign Up
          </Link>
        </div>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-white rounded-full animate-bounce delay-300 opacity-60"></div>
      <div className="absolute top-32 right-16 w-3 h-3 bg-golf-green-300 rounded-full animate-bounce delay-500 opacity-70"></div>
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-white rounded-full animate-bounce delay-700 opacity-50"></div>
      <div className="absolute bottom-40 right-12 w-6 h-6 bg-golf-green-400 rounded-full animate-bounce delay-1000 opacity-60"></div>
      
      {/* Mobile optimization overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none"></div>
    </div>
  );
}