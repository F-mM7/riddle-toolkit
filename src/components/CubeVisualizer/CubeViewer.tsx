import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import Cube3D from './Cube3D';
import { FaceMapping } from '../../types/cube';
import styles from './CubeViewer.module.css';
import * as THREE from 'three';

/** 上下左右ボタンによる90度回転1回の所要時間(秒)。フレームレートに依存しない */
const ROTATION_DURATION_SEC = 0.3;

interface CubeViewerProps {
  faceMappings: FaceMapping[];
  /** 有効な展開図かどうか。false の間は立方体の代わりに説明文を出し、回転ボタンを無効にする */
  ready: boolean;
}

export default function CubeViewer({ faceMappings, ready }: CubeViewerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [rotationQueue, setRotationQueue] = useState<Array<{ axis: THREE.Vector3; angle: number }>>(
    []
  );

  // 展開図が無効になったら(Canvas も外れるので)未消化の回転を破棄する
  if (!ready && rotationQueue.length > 0) {
    setRotationQueue([]);
  }

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

    setRotationQueue((prev) => [...prev, { axis: axisVector, angle }]);
  };

  return (
    <div className={styles.cubeViewer}>
      <div className={styles.controlsContainer}>
        {/* 上ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateTop}`}
          onClick={() => handleRotate('up')}
          title="上に転がす"
          disabled={!ready}
        >
          ↑
        </button>

        {/* 左ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateLeft}`}
          onClick={() => handleRotate('left')}
          title="左に転がす"
          disabled={!ready}
        >
          ←
        </button>

        {/* 3Dキャンバス(未完成の間は同じ枠に説明文) */}
        {ready ? (
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
              <TrackballControls noPan noZoom minDistance={3} maxDistance={3} rotateSpeed={8} />
            </Canvas>
          </div>
        ) : (
          <div className={`${styles.canvas} ${styles.placeholder}`}>
            <p>有効な展開図を入力してください</p>
            <p className={styles.hint}>
              上段で立方体の展開図になる6マスを選択し、下段で文字を入力してください
            </p>
          </div>
        )}

        {/* 右ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateRight}`}
          onClick={() => handleRotate('right')}
          title="右に転がす"
          disabled={!ready}
        >
          →
        </button>

        {/* 下ボタン */}
        <button
          className={`${styles.rotateButton} ${styles.rotateBottom}`}
          onClick={() => handleRotate('down')}
          title="下に転がす"
          disabled={!ready}
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

function AnimatedCube({
  faceMappings,
  groupRef,
  cameraRef,
  rotationQueue,
  onRotationComplete,
}: AnimatedCubeProps) {
  const { camera } = useThree();
  const animationStateRef = useRef<{
    axis: THREE.Vector3;
    targetAngle: number;
    /** 回転開始からの経過時間(秒) */
    elapsed: number;
    /** これまでに適用した回転角(ラジアン) */
    appliedAngle: number;
  } | null>(null);

  // Canvas は展開図が有効な間だけ存在するので、付け外しのたびにカメラ参照を更新する
  useEffect(() => {
    cameraRef.current = camera;
    return () => {
      cameraRef.current = null;
    };
  }, [camera, cameraRef]);

  useFrame((_, delta) => {
    if (animationStateRef.current) {
      const state = animationStateRef.current;
      state.elapsed = Math.min(state.elapsed + delta, ROTATION_DURATION_SEC);
      // 経過時間に比例した角度まで進める(最終フレームで目標角ちょうどに揃う)
      const nextAngle = (state.targetAngle * state.elapsed) / ROTATION_DURATION_SEC;
      const stepAngle = nextAngle - state.appliedAngle;
      state.appliedAngle = nextAngle;
      const { axis } = state;

      const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, stepAngle);

      camera.position.applyQuaternion(rotationQuaternion);
      currentUp.applyQuaternion(rotationQuaternion);

      camera.lookAt(0, 0, 0);
      camera.up.copy(currentUp);
      camera.lookAt(0, 0, 0);

      if (state.elapsed >= ROTATION_DURATION_SEC) {
        animationStateRef.current = null;
        onRotationComplete();
      }
    } else if (rotationQueue.length > 0) {
      const { axis, angle } = rotationQueue[0];
      animationStateRef.current = {
        axis,
        targetAngle: angle,
        elapsed: 0,
        appliedAngle: 0,
      };
    }
  });

  return (
    <group ref={groupRef}>
      <Cube3D faceMappings={faceMappings} />
    </group>
  );
}
