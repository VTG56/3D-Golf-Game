import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Text } from "@react-three/drei";
import { Vector3 } from "three";
import { useParams, useNavigate } from "react-router-dom";
import levels, { calculateStars, getNextLevel } from "../utils/levels";
import EndOfRound from "../components/EndOfRound";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";

// ---------------- Golf Ball ----------------
function GolfBall({ position, velocity, onPositionChange, isMoving, setIsMoving }) {
  const ballRef = React.useRef();

  useFrame((_, delta) => {
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

// ---------------- Golf Course ----------------
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

// ---------------- Power Meter ----------------
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

// ---------------- Main Game ----------------
function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProgress, getGuestId } = useProgress();

  const level = levels.find((lvl) => lvl.id === parseInt(levelId));
  if (!level) return <div>Invalid level</div>;

  const [gameStarted, setGameStarted] = useState(false);
  const [ballPosition, setBallPosition] = useState(new Vector3(level.ballStart.x, level.ballStart.y, level.ballStart.z));
  const [ballVelocity, setBallVelocity] = useState(new Vector3(0, 0, 0));
  const [isMoving, setIsMoving] = useState(false);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [shots, setShots] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // NEW: Direction states
  const [isSettingDirection, setIsSettingDirection] = useState(false);
  const [directionAngle, setDirectionAngle] = useState(0); // radians

  const maxPower = 15;

  // Start timer
  useEffect(() => {
    if (gameStarted) setStartTime(Date.now());
  }, [gameStarted]);

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
    const hole = new Vector3(level.holePosition.x, level.holePosition.y, level.holePosition.z);
    if (ballPosition.distanceTo(hole) < level.holeRadius && !isMoving && !gameWon) {
      setGameWon(true);

      // Calculate results
      const time = Math.floor((Date.now() - startTime) / 1000);
      const stars = calculateStars(shots, level.par);
      setTimeTaken(time);
      setStarsEarned(stars);

      // Save progress
      const uid = user && !user.isAnonymous ? user.uid : null;
      const guestId = !uid ? getGuestId() : null;

      setProgress({
        uid,
        guestId,
        levelId: level.id,
        strokes: shots,
        stars,
        timeTaken: time,
      });

      setTimeout(() => setShowEndScreen(true), 1000); // delay for effect
    }
  }, [ballPosition, isMoving]);

  // --- Direction toggle ---
  const toggleDirectionMode = () => {
    setIsSettingDirection((prev) => !prev);
  };

  // --- Handle arrow keys while setting direction ---
  useEffect(() => {
    if (!isSettingDirection) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setDirectionAngle((a) => a + 0.1);
      }
      if (e.key === "ArrowRight") {
        setDirectionAngle((a) => a - 0.1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingDirection]);

  // --- Shooting ---
  const handleMouseDown = () => {
    if (isMoving || gameWon) return;
    setIsCharging(true);
    setPower(0);
  };

  const handleMouseUp = () => {
    if (!isCharging || isMoving || gameWon) return;
    setIsCharging(false);

    // use chosen direction vector
    const dir = new Vector3(Math.cos(directionAngle), 0, -Math.sin(directionAngle));




    const shotVelocity = dir.multiplyScalar(power * 0.8);
    shotVelocity.y = power * 0.1;

    setBallVelocity(shotVelocity);
    setIsMoving(true);
    setShots((s) => s + 1);
    setPower(0);
  };

  const resetGame = () => {
    setBallPosition(new Vector3(level.ballStart.x, level.ballStart.y, level.ballStart.z));
    setBallVelocity(new Vector3(0, 0, 0));
    setIsMoving(false);
    setPower(0);
    setIsCharging(false);
    setShots(0);
    setGameWon(false);
    setShowEndScreen(false);
    setStarsEarned(0);
    setTimeTaken(0);
    setStartTime(Date.now());
  };

  // Navigation
  const handleNextLevel = () => {
    const next = getNextLevel(level.id);
    if (next) {
      navigate(`/game/${next.id}`);
      window.location.reload();
    } else {
      navigate("/levels");
    }
  };

  const handleBackToLevels = () => {
    navigate("/levels");
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

  if (showEndScreen) {
    return (
      <EndOfRound
        strokes={shots}
        starsEarned={starsEarned}
        timeTaken={timeTaken}
        par={level.par}
        onNextLevel={handleNextLevel}
        onBackToLevels={handleBackToLevels}
      />
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

          {/* Direction Needle (flat arrow) */}
          {isSettingDirection && (
            <group
              position={[ballPosition.x, ballPosition.y + 0.1, ballPosition.z]}
              rotation={[0, directionAngle, 0]} // rotate around Y
            >
              {/* Shaft (flat box) */}
              <mesh position={[0.5, 0, 0]}>
                <boxGeometry args={[1, 0.02, 0.05]} />
                <meshStandardMaterial color="red" />
              </mesh>

              {/* Arrow head (triangle/cone lying flat) */}
              <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[0.15, 0.3, 8]} />
                <meshStandardMaterial color="red" />
              </mesh>
            </group>
          )}

          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.2}
          enabled={!isSettingDirection}
        />
      </Canvas>

      {/* UI */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <div>Shots: {shots}</div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={toggleDirectionMode}
          className={`px-4 py-2 ${isSettingDirection ? "bg-yellow-500" : "bg-blue-500"} text-white rounded-lg`}
        >
          {isSettingDirection ? "Confirm Direction" : "Set Direction"}
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
        {isSettingDirection ? "← → to adjust direction" : "Drag to rotate camera • Mouse wheel to zoom"}
      </div>
    </div>
  );
}

export default Game;
