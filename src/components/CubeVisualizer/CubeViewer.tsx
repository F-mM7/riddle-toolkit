import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { useRef, useState } from "react";
import Cube3D from "./Cube3D";
import { FaceMapping } from "../../types/cube";
import styles from "./CubeViewer.module.css";
import * as THREE from "three";

interface CubeViewerProps {
  faceMappings: FaceMapping[];
}

export default function CubeViewer({ faceMappings }: CubeViewerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [rotationQueue, setRotationQueue] = useState<Array<{ axis: THREE.Vector3; angle: number }>>([]);

  const handleRotate = (direction: 'up' | 'down' | 'left' | 'right') => {
    const camera = cameraRef.current;
    if (!camera) return;

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    let axisVector: THREE.Vector3;
    let angle: number;

    if (direction === 'right') {
      axisVector = cameraUp;
      angle = -Math.PI / 2;
    } else if (direction === 'left') {
      axisVector = cameraUp;
      angle = Math.PI / 2;
    } else if (direction === 'up') {
      axisVector = cameraRight;
      angle = Math.PI / 2;
    } else {
      axisVector = cameraRight;
      angle = -Math.PI / 2;
    }

    setRotationQueue(prev => [...prev, { axis: axisVector, angle }]);
  };

  return (
    <div className={styles.cubeViewer}>
      <div className={styles.controlsContainer}>
        {/* 上ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateTop}`}
          onClick={() => handleRotate('up')}
          title="上に転がす"
        >
          ↑
        </button>

        {/* 左ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateLeft}`}
          onClick={() => handleRotate('left')}
          title="左に転がす"
        >
          ←
        </button>

        {/* 3Dキャンバス */}
        <div className={styles.canvas}>
          <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <AnimatedCube
              faceMappings={faceMappings}
              groupRef={groupRef}
              cameraRef={cameraRef}
              rotationQueue={rotationQueue}
              onRotationComplete={() => setRotationQueue([])}
            />
            <TrackballControls
              noPan
              noZoom
              minDistance={3}
              maxDistance={3}
              rotateSpeed={8}
            />
          </Canvas>
        </div>

        {/* 右ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateRight}`}
          onClick={() => handleRotate('right')}
          title="右に転がす"
        >
          →
        </button>

        {/* 下ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateBottom}`}
          onClick={() => handleRotate('down')}
          title="下に転がす"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

// アニメーション付きキューブコンポーネント
interface AnimatedCubeProps {
  faceMappings: FaceMapping[];
  groupRef: React.RefObject<THREE.Group | null>;
  cameraRef: React.RefObject<THREE.Camera | null>;
  rotationQueue: Array<{ axis: THREE.Vector3; angle: number }>;
  onRotationComplete: () => void;
}

function AnimatedCube({ faceMappings, groupRef, cameraRef, rotationQueue, onRotationComplete }: AnimatedCubeProps) {
  const { camera } = useThree();
  const animationStateRef = useRef<{
    axis: THREE.Vector3;
    targetAngle: number;
    currentStep: number;
    totalSteps: number;
  } | null>(null);

  if (camera && !cameraRef.current) {
    cameraRef.current = camera;
  }

  useFrame(() => {
    if (animationStateRef.current) {
      const { axis, targetAngle, totalSteps } = animationStateRef.current;
      const stepAngle = targetAngle / totalSteps;

      const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, stepAngle);

      camera.position.applyQuaternion(rotationQuaternion);
      currentUp.applyQuaternion(rotationQuaternion);

      camera.lookAt(0, 0, 0);
      camera.up.copy(currentUp);
      camera.lookAt(0, 0, 0);

      animationStateRef.current.currentStep++;

      if (animationStateRef.current.currentStep >= totalSteps) {
        animationStateRef.current = null;
        onRotationComplete();
      }
    } else if (rotationQueue.length > 0) {
      const { axis, angle } = rotationQueue[0];
      animationStateRef.current = {
        axis,
        targetAngle: angle,
        currentStep: 0,
        totalSteps: 30
      };
    }
  });

  return (
    <group ref={groupRef}>
      <Cube3D faceMappings={faceMappings} />
    </group>
  );
}
