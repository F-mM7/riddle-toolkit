import { useMemo } from "react";
import * as THREE from "three";
import { FaceMapping } from "../../types/cube";

interface Cube3DProps {
  faceMappings: FaceMapping[];
}

/**
 * Canvasでテキストをレンダリングしてテクスチャ化
 */
function createTextTexture(char: string, rotation: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 512;
  canvas.height = 512;

  // 背景を白に
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 512);

  // テキストを描画
  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 320px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * デフォルトの白いテクスチャを作成
 */
function createDefaultTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 512;
  canvas.height = 512;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function Cube3D({ faceMappings }: Cube3DProps) {
  // 面のマッピングからマテリアルを生成
  const materials = useMemo(() => {
    // Three.jsのBoxGeometryの面の順序:
    // 0: +X (right), 1: -X (left), 2: +Y (top), 3: -Y (bottom), 4: +Z (front), 5: -Z (back)

    const faceOrder: Array<FaceMapping["face"]> = [
      "right",  // 0
      "left",   // 1
      "top",    // 2
      "bottom", // 3
      "front",  // 4
      "back",   // 5
    ];

    return faceOrder.map((faceName) => {
      const mapping = faceMappings.find((m) => m.face === faceName);

      if (mapping && mapping.char) {
        const texture = createTextTexture(mapping.char, mapping.rotation);
        return new THREE.MeshBasicMaterial({ map: texture });
      } else {
        const texture = createDefaultTexture();
        return new THREE.MeshBasicMaterial({ map: texture });
      }
    });
  }, [faceMappings]);

  return (
    <>
      <mesh material={materials}>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
    </>
  );
}
