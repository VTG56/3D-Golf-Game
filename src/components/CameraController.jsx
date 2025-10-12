import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraController({ ballPosition, goalPosition, isAiming, gameStarted }) {
  const { camera } = useThree();
  const cameraOffset = useRef(new THREE.Vector3(0, 5, -8)); // behind & above

  useFrame(() => {
    if (!gameStarted) {
      // Before game starts → show both ball and hole
      const midpoint = new THREE.Vector3()
        .addVectors(ballPosition, goalPosition)
        .multiplyScalar(0.5);

      camera.position.lerp(new THREE.Vector3(midpoint.x, 12, midpoint.z + 10), 0.05);
      camera.lookAt(midpoint);
      return;
    }

    // Once game starts → follow ball
    const targetPosition = new THREE.Vector3().copy(ballPosition).add(cameraOffset.current);

    // Smooth follow
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(ballPosition);
  });

  return null;
}
