import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import Cube3D from "./Cube3D";
import { FaceMapping } from "../../types/cube";
import styles from "./CubeViewer.module.css";

interface CubeViewerProps {
  faceMappings: FaceMapping[];
}

export default function CubeViewer({ faceMappings }: CubeViewerProps) {
  return (
    <div className={styles.cubeViewer}>
      <div className={styles.canvas}>
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          <Cube3D faceMappings={faceMappings} />
          <TrackballControls
            noPan
            noZoom
            minDistance={3}
            maxDistance={3}
            rotateSpeed={8}
          />
        </Canvas>
      </div>
    </div>
  );
}
