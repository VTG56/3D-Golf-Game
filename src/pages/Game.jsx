import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";   // <-- ✅ include useFrame here
import { OrbitControls, Environment, Text } from "@react-three/drei";
import { Vector3 } from "three";
import { useParams, useNavigate } from "react-router-dom";
import levels from "../utils/levels";   // ✅ adjust path depending on your folder

// Golf Ball Component
function GolfBall({ position, velocity, onPositionChange, isMoving, setIsMoving }) {
  const ballRef = React.useRef();

  useFrame((state, delta) => {
    if (!ballRef.current || !isMoving) return;

    const newPos = position.clone().add(velocity.clone().multiplyScalar(delta));

    // Friction
    velocity.multiplyScalar(0.98);

    // Gravity
    velocity.y -= 9.8 * delta * 0.1;

    // Bounce
    if (newPos.y <= 0.1) {
      newPos.y = 0.1;
      velocity.y = Math.abs(velocity.y) * 0.6;
      velocity.x *= 0.8;
      velocity.z *= 0.8;
    }

    // Stop if velocity small
    if (velocity.length() < 0.1) {
      setIsMoving(false);
      velocity.set(0, 0, 0);
    }

    onPositionChange(newPos);
  });

  return (
    <mesh ref={ballRef} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// Golf Course
function GolfCourse() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshStandardMaterial color="#2d5a2d" />
      </mesh>

      <mesh position={[8, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      <group position={[8, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.3, 1.7, 0]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color="#ff0000" side={2} />
        </mesh>
      </group>
    </group>
  );
}

// Power Meter
function PowerMeter({ power, maxPower }) {
  return (
    <div className="absolute bottom-20 left-4 bg-black/50 p-4 rounded-lg">
      <div className="text-white mb-2">Power</div>
      <div className="w-4 h-32 bg-gray-700 rounded">
        <div
          className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded transition-all duration-100"
          style={{ height: `${(power / maxPower) * 100}%` }}
        />
      </div>
      <div className="text-white text-sm mt-1">{Math.round(power)}</div>
    </div>
  );
}

// Main Game
function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const level = levels[id - 1];

  const [gameStarted, setGameStarted] = useState(false);
  const [ballPosition, setBallPosition] = useState(new Vector3(-8, 0.1, 0));
  const [ballVelocity, setBallVelocity] = useState(new Vector3(0, 0, 0));
  const [isMoving, setIsMoving] = useState(false);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [shots, setShots] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const maxPower = 15;

  // Power charging
  useEffect(() => {
    if (!isCharging) return;
    const interval = setInterval(() => {
      setPower((prev) => (prev + 0.5 > maxPower ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, [isCharging]);

  // Check win
  useEffect(() => {
    const hole = new Vector3(8, 0.1, 0);
    if (ballPosition.distanceTo(hole) < 0.4 && !isMoving) {
      setGameWon(true);
    }
  }, [ballPosition, isMoving]);

  const handleMouseDown = () => {
    if (isMoving || gameWon) return;
    setIsCharging(true);
    setPower(0);
  };

  const handleMouseUp = () => {
    if (!isCharging || isMoving || gameWon) return;
    setIsCharging(false);

    const hole = new Vector3(8, 0, 0);
    const dir = hole.clone().sub(ballPosition).normalize();

    const shotVelocity = dir.multiplyScalar(power * 0.8);
    shotVelocity.y = power * 0.1;

    setBallVelocity(shotVelocity);
    setIsMoving(true);
    setShots((s) => s + 1);
    setPower(0);
  };

  const resetGame = () => {
    setBallPosition(new Vector3(-8, 0.1, 0));
    setBallVelocity(new Vector3(0, 0, 0));
    setIsMoving(false);
    setPower(0);
    setIsCharging(false);
    setShots(0);
    setGameWon(false);
  };

  if (!gameStarted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-400">
        <div className="text-center">
          <Canvas className="w-full h-64 mb-8">
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Text font="/fonts/Geist_Bold.json" size={2} height={0.2} position={[-6, 0, 0]}>
              MINI GOLF
              <meshStandardMaterial color="#4a7c4a" />
            </Text>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl rounded-lg"
          >
            PLAY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ position: [-5, 8, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <GolfCourse />
          <GolfBall
            position={ballPosition}
            velocity={ballVelocity}
            onPositionChange={setBallPosition}
            isMoving={isMoving}
            setIsMoving={setIsMoving}
          />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>

      {/* UI */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <div>Shots: {shots}</div>
        {gameWon && <div className="text-green-400 font-bold">Hole in {shots}!</div>}
      </div>

      <div className="absolute top-4 right-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Reset
        </button>
      </div>

      {!gameWon && (
        <>
          <PowerMeter power={power} maxPower={maxPower} />
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white p-4 rounded-lg cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isMoving ? "Ball Moving..." : "Hold to Charge Shot"}
          </div>
        </>
      )}

      <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
        Drag to rotate camera • Mouse wheel to zoom
      </div>
    </div>
  );
}

export default Game;
