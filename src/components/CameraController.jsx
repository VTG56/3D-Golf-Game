import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraController({ ballPosition, ballSpeed }) {
  const orbitControlsRef = useRef();
  const { camera } = useThree();
  
  // Camera follow settings
  const followOffset = { x: -5, y: 4, z: 0 }; // Behind and above ball
  const followSmoothing = 0.05; // Smoothing factor for camera follow
  const speedThreshold = 0.2; // Speed threshold to enable/disable orbit controls
  
  // Target position for smooth camera movement
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  
  // Track if we're in follow mode or orbit mode
  const isFollowingRef = useRef(false);
  const wasFollowingRef = useRef(false);
  
  // Initialize camera position based on ball position
  useEffect(() => {
    if (ballPosition) {
      const initialPos = new THREE.Vector3(
        ballPosition.x + followOffset.x,
        ballPosition.y + followOffset.y,
        ballPosition.z + followOffset.z
      );
      
      camera.position.copy(initialPos);
      camera.lookAt(ballPosition.x, ballPosition.y, ballPosition.z);
      
      // Set initial orbit controls target
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(ballPosition.x, ballPosition.y, ballPosition.z);
        orbitControlsRef.current.update();
      }
    }
  }, []); // Only run once on mount

  useFrame((state, delta) => {
    if (!ballPosition || !orbitControlsRef.current) return;

    const ballPos = new THREE.Vector3(ballPosition.x, ballPosition.y, ballPosition.z);
    const controls = orbitControlsRef.current;
    
    // Determine if ball is moving fast enough to trigger follow mode
    const shouldFollow = ballSpeed > speedThreshold;
    isFollowingRef.current = shouldFollow;
    
    if (shouldFollow) {
      // Ball is moving - enter follow mode
      
      // Disable orbit controls
      controls.enabled = false;
      
      // Calculate target camera position (behind and above ball)
      targetPosition.current.set(
        ballPos.x + followOffset.x,
        ballPos.y + followOffset.y,
        ballPos.z + followOffset.z
      );
      
      // Target look-at point (slightly ahead of ball based on velocity if available)
      targetLookAt.current.copy(ballPos);
      
      // Smooth camera movement
      camera.position.lerp(targetPosition.current, followSmoothing);
      
      // Smooth camera look-at
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);
      
      const newLookAt = new THREE.Vector3().lerpVectors(currentLookAt, targetLookAt.current, followSmoothing);
      camera.lookAt(newLookAt);
      
      // Update orbit controls target to ball position for smooth transition
      controls.target.lerp(ballPos, followSmoothing);
      
    } else {
      // Ball is stationary - allow orbit controls
      
      // Enable orbit controls if they were disabled
      if (!controls.enabled) {
        controls.enabled = true;
        
        // Smooth transition from follow mode to orbit mode
        if (wasFollowingRef.current) {
          controls.target.copy(ballPos);
          controls.update();
        }
      }
      
      // Ensure orbit controls target stays on the ball
      if (controls.target.distanceTo(ballPos) > 0.1) {
        controls.target.lerp(ballPos, 0.02);
      }
    }
    
    // Track previous follow state for smooth transitions
    wasFollowingRef.current = shouldFollow;
  });

  return (
    <OrbitControls
      ref={orbitControlsRef}
      // Camera constraints to prevent clipping through terrain
      minDistance={2}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.2} // Prevent camera from going below ground
      
      // Smooth controls
      enableDamping={true}
      dampingFactor={0.05}
      
      // Mobile-friendly settings
      enableRotate={true}
      enableZoom={true}
      enablePan={false} // Disable panning to keep focus on ball
      
      // Touch settings for mobile
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY // Pinch to zoom
      }}
      
      // Mouse settings
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: null // Disable right-click pan
      }}
      
      // Rotation speed (adjust for mobile sensitivity)
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      
      // Auto rotation when idle (optional - can be removed if not desired)
      // autoRotate={ballSpeed < 0.1}
      // autoRotateSpeed={0.5}
    />
  );
}