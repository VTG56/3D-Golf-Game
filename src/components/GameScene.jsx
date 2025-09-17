import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Import modular components
import GolfBall from './GolfBall';
import Terrain from './Terrain';
import Goal from './Goal';
import CameraController from './CameraController';

export default function GameScene({ level, onComplete }) {
  // Game state
  const [strokes, setStrokes] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [ballPosition, setBallPosition] = useState(level.ballStart);
  const [ballSpeed, setBallSpeed] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  
  // Refs for tracking
  const ballRef = useRef();
  const gameStartTime = useRef(null);
  const gameTimer = useRef(null);
  const completedRef = useRef(false);

  // Handle ball position updates
  const handlePositionUpdate = useCallback((position) => {
    setBallPosition({ x: position[0], y: position[1], z: position[2] });
  }, []);

  // Handle ball speed updates
  const handleSpeedUpdate = useCallback((speed) => {
    setBallSpeed(speed);
  }, []);

  // Handle stroke (ball starts moving)
  const handleStroke = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      gameStartTime.current = Date.now();
      
      // Start timer
      gameTimer.current = setInterval(() => {
        if (gameStartTime.current && !completedRef.current) {
          setTimeTaken(Math.floor((Date.now() - gameStartTime.current) / 1000));
        }
      }, 1000);
    }
    
    setStrokes(prev => prev + 1);
  }, [gameStarted]);

  // Handle goal completion
  const handleGoal = useCallback(() => {
    if (completedRef.current) return; // Prevent multiple calls
    
    completedRef.current = true;
    setGameComplete(true);
    
    // Stop timer
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }
    
    const finalTime = gameStartTime.current ? 
      Math.floor((Date.now() - gameStartTime.current) / 1000) : 0;
    
    setTimeTaken(finalTime);

    // Calculate stars earned based on strokes vs par
    let starsEarned = 0;
    const par = level.par || 3;
    
    if (strokes <= par - 2) {
      starsEarned = 3; // Eagle or better
    } else if (strokes <= par - 1) {
      starsEarned = 2; // Birdie
    } else if (strokes <= par + 1) {
      starsEarned = 1; // Par or bogey
    } else {
      starsEarned = 0; // Double bogey or worse
    }

    // Call completion callback with results
    setTimeout(() => {
      onComplete?.({
        strokes,
        starsEarned,
        timeTaken: finalTime,
        par: par
      });
    }, 1500); // Delay to show goal animation

  }, [strokes, level.par, onComplete]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
      }
    };
  }, []);

  // Reset function for restarting level
  const resetLevel = useCallback(() => {
    setStrokes(0);
    setGameStarted(false);
    setGameComplete(false);
    setTimeTaken(0);
    setBallSpeed(0);
    completedRef.current = false;
    
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
      gameTimer.current = null;
    }
    gameStartTime.current = null;

    // Reset ball position and physics
    if (ballRef.current) {
      ballRef.current.position.set(
        level.ballStart.x, 
        level.ballStart.y, 
        level.ballStart.z
      );
      ballRef.current.velocity.set(0, 0, 0);
      ballRef.current.angularVelocity.set(0, 0, 0);
    }
    
    setBallPosition(level.ballStart);
  }, [level.ballStart]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* HUD Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        minWidth: '200px'
      }}>
        <div>Strokes: <strong>{strokes}</strong></div>
        <div>Par: <strong>{level.par || 3}</strong></div>
        {gameStarted && (
          <div>Time: <strong>{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</strong></div>
        )}
        <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
          Speed: {ballSpeed.toFixed(1)}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetLevel}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px'
        }}
      >
        Reset
      </button>

      {/* Goal Complete Overlay */}
      {gameComplete && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#4CAF50' }}>Hole Complete!</h2>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Strokes: <strong>{strokes}</strong> (Par {level.par || 3})
          </div>
          <div style={{ fontSize: '16px', marginBottom: '20px' }}>
            Time: <strong>{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</strong>
          </div>
          <div style={{ fontSize: '24px' }}>
            {'⭐'.repeat(Math.max(0, 
              strokes <= (level.par || 3) - 2 ? 3 :
              strokes <= (level.par || 3) - 1 ? 2 :
              strokes <= (level.par || 3) + 1 ? 1 : 0
            ))}
          </div>
        </div>
      )}

      {/* Instructions Overlay (only show before first stroke) */}
      {!gameStarted && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '5px' }}>🏌️ Drag the ball to aim</div>
          <div>Release to shoot!</div>
        </div>
      )}

      {/* 3D Canvas Scene */}
      <Canvas
        shadows
        camera={{ 
          position: [level.ballStart.x - 5, level.ballStart.y + 4, level.ballStart.z],
          fov: 75,
          near: 0.1,
          far: 100
        }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
        onPointerMissed={() => {
          // Handle clicks outside of objects
        }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Sky Environment */}
        <Sky 
          sunPosition={[100, 20, 100]}
          inclination={0.6}
          azimuth={0.25}
        />

        {/* Physics World */}
        <Physics 
          gravity={[0, -30, 0]}  // Stronger gravity
          defaultContactMaterial={{
            friction: 0.4,
            restitution: 0.3,
          }}
          tolerance={0.001}
          iterations={20}
        >
          {/* Terrain */}
          <Terrain level={level} />

          {/* Golf Ball */}
          <GolfBall
            position={[level.ballStart.x, level.ballStart.y, level.ballStart.z]}
            onPositionUpdate={handlePositionUpdate}
            onSpeedUpdate={handleSpeedUpdate}
            onStroke={handleStroke}
            ballRef={ballRef}
          />

          {/* Goal */}
          <Goal
            position={[level.holePosition.x, level.holePosition.y, level.holePosition.z]}
            radius={level.holeRadius || 0.5}
            onGoal={handleGoal}
          />
        </Physics>

        {/* Camera Controller */}
        <CameraController
          ballPosition={ballPosition}
          ballSpeed={ballSpeed}
        />

        {/* Environment Effects */}
        <Environment preset="park" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#87CEEB', 30, 100]} />
      </Canvas>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        button:hover {
          background: #ff5252 !important;
          transform: scale(1.05);
        }
        
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}