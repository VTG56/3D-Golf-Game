import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

export default function Goal({ position, radius = 0.5, onGoal }) {
  const [isGoalTriggered, setIsGoalTriggered] = useState(false);
  const [ballInHole, setBallInHole] = useState(false);
  const [animationScale, setAnimationScale] = useState(1);
  
  const goalCalledRef = useRef(false);
  const flagRef = useRef();
  const ballDetectionTimer = useRef(null);
  
  // Physics trigger zone - box-shaped trigger slightly above ground
  const [triggerRef, triggerApi] = useBox(() => ({
    position: [position[0], position[1] + 0.1, position[2]],
    args: [radius * 2, 0.2, radius * 2], // Box trigger zone
    isTrigger: true,
    type: 'Static',
    onCollide: (e) => {
      // Handle collision with the trigger
      if (e.body && !goalCalledRef.current) {
        setBallInHole(true);
        
        // Set a timer to check if ball stays in hole
        if (ballDetectionTimer.current) {
          clearTimeout(ballDetectionTimer.current);
        }
        
        ballDetectionTimer.current = setTimeout(() => {
          if (ballInHole && !goalCalledRef.current) {
            setIsGoalTriggered(true);
            goalCalledRef.current = true;
            onGoal?.();
          }
        }, 500); // Wait 500ms to ensure ball has settled
      }
    }
  }));

  // Alternative collision detection using distance-based approach
  const ballPositionRef = useRef([0, 0, 0]);
  const ballVelocityRef = useRef([0, 0, 0]);

  useFrame((state) => {
    // Simple scaling animation when goal is triggered
    if (isGoalTriggered) {
      setAnimationScale(1 + Math.sin(Date.now() * 0.01) * 0.1);
    }

    // Gentle flag waving animation
    if (flagRef.current) {
      const time = Date.now() * 0.003;
      flagRef.current.rotation.y = Math.sin(time) * 0.1;
    }

    // Distance-based ball detection as backup
    if (!goalCalledRef.current) {
      // Try to find ball in the scene (this is a fallback method)
      const ball = state.scene.getObjectByName('golf-ball');
      if (ball) {
        const ballPos = ball.position;
        const goalPos = new THREE.Vector3(position[0], position[1], position[2]);
        const distance = ballPos.distanceTo(goalPos);
        
        // If ball is close enough to the hole
        if (distance < radius && ballPos.y <= goalPos.y + 0.3) {
          if (!ballInHole) {
            setBallInHole(true);
            
            // Set timer for goal detection
            if (ballDetectionTimer.current) {
              clearTimeout(ballDetectionTimer.current);
            }
            
            ballDetectionTimer.current = setTimeout(() => {
              if (!goalCalledRef.current) {
                setIsGoalTriggered(true);
                goalCalledRef.current = true;
                onGoal?.();
              }
            }, 1000);
          }
        } else if (distance > radius * 1.5) {
          // Ball moved away from hole
          setBallInHole(false);
          if (ballDetectionTimer.current) {
            clearTimeout(ballDetectionTimer.current);
          }
        }
      }
    }
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (ballDetectionTimer.current) {
        clearTimeout(ballDetectionTimer.current);
      }
    };
  }, []);

  return (
    <group position={position}>
      {/* Golf Hole - Ring geometry for the hole opening */}
      <mesh
        position={[0, -0.05, 0]} // Slightly inset into ground
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[animationScale, animationScale, 1]}
      >
        <ringGeometry args={[0, radius, 16]} />
        <meshStandardMaterial 
          color="#000000" 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hole depth indicator - dark cylinder */}
      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[animationScale, animationScale, 1]}
      >
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.2, 12]} />
        <meshStandardMaterial 
          color="#111111"
          roughness={1}
        />
      </mesh>

      {/* Flag pole */}
      <mesh
        position={[radius + 0.3, 1, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Flag */}
      <group
        ref={flagRef}
        position={[radius + 0.3, 1.5, 0]}
      >
        <mesh
          position={[0.15, 0, 0]}
          castShadow
        >
          {/* Triangular flag */}
          <planeGeometry args={[0.3, 0.2]} />
          <meshStandardMaterial 
            color="#ff0000"
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      </group>

      {/* Optional: Goal glow effect when triggered */}
      {isGoalTriggered && (
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius * 0.8, radius * 1.3, 16]} />
          <meshBasicMaterial 
            color="#00ff00"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Physics trigger zone (invisible) */}
      <mesh
        ref={triggerRef}
        visible={false}
      >
        <boxGeometry args={[radius * 2, 0.2, radius * 2]} />
      </mesh>

      {/* Hole rim - slight raised edge */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[animationScale, animationScale, 1]}
      >
        <ringGeometry args={[radius * 0.95, radius * 1.1, 16]} />
        <meshStandardMaterial 
          color="#2d5a3d"
          roughness={0.9}
        />
      </mesh>

      {/* Optional: Particle effect or sparkles when goal is achieved */}
      {isGoalTriggered && (
        <group>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * radius * 1.5,
                0.5,
                Math.sin((i / 8) * Math.PI * 2) * radius * 1.5
              ]}
              scale={[0.1, 0.1, 0.1]}
            >
              <sphereGeometry args={[1, 4, 4]} />
              <meshBasicMaterial 
                color="#ffff00"
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}