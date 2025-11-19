// ベン図の2円のみの重なり領域を最大化する距離を計算（改良版）

const R = 120; // 半径

// 2円の重なり面積（レンズ型）
function lensArea(d, R) {
  if (d >= 2 * R) return 0;
  if (d <= 0) return Math.PI * R * R;

  const acos = Math.acos(d / (2 * R));
  const sqrt = Math.sqrt(4 * R * R - d * d);
  return 2 * R * R * acos - (d / 2) * sqrt;
}

// 3円の重なり領域の面積（正確な計算）
// 正三角形配置で中心間距離がdの場合
function threewayArea(d, R) {
  // 重心から各円の中心までの距離
  const h = d / Math.sqrt(3);

  // 3円が1点でも重なる条件
  if (R <= h) return 0;

  // 2円の交点を求める
  // 円1と円2の交点（x軸上に配置した場合）
  if (d >= 2 * R) return 0;

  // 交点の位置（円1の中心から見て）
  const x = d / 2;
  const y = Math.sqrt(R * R - x * x);

  // 3つの円の中心を配置
  // 中心を原点として、正三角形配置
  const c1 = { x: 0, y: 2 * h / Math.sqrt(3) };
  const c2 = { x: -d / 2, y: -h / Math.sqrt(3) };
  const c3 = { x: d / 2, y: -h / Math.sqrt(3) };

  // 重心（原点）からの距離がR未満の領域を各円が持つ
  // 3円すべてが重なる領域は、すべての円の内部にある点の集合

  // 簡略化された公式を使用
  // Reuleaux三角形の面積に基づく計算

  // 正三角形の1辺の長さ = d
  // 各頂点を中心とする半径Rの円弧が作る曲線三角形

  // 3円の重なり領域 = 3つの円形セグメントの和 - 2 × 正三角形の面積
  // ただし、これは近似

  // より正確には、各2円の交点を計算し、それらが作る領域を求める

  // 2円の交点間の弦の長さ
  const chordLength = 2 * Math.sqrt(R * R - (d / 2) * (d / 2));

  // 各円のペアについて、交点を計算
  // 3つの交点が作る三角形の面積

  // 幾何学的に、3円の重なり領域は:
  // = 3 × (扇形の面積) - (3つの交点が作る三角形の面積を含む調整)

  // 正確な公式（対称性を利用）:
  // 中心角を計算
  const alpha = 2 * Math.asin(chordLength / (2 * R));

  // 各円が寄与する扇形の面積
  const sectorArea = 0.5 * R * R * alpha;

  // 3つの交点の座標を計算（複雑）
  // 簡略化: 内接する領域の近似計算

  // Reuleaux三角形型領域の面積公式
  // A = (π - √3) R² （ただし、辺の長さ = R の場合）
  // 今回は辺の長さ = d なので、スケーリング

  // より実用的な計算:
  // 3つのレンズ領域の重なりを計算

  // 簡易版: 数値積分
  // グリッド上で各点が3つの円すべてに含まれるかチェック

  let count = 0;
  const samples = 1000;
  const range = R + h;

  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      const px = -range + (2 * range * i) / samples;
      const py = -range + (2 * range * j) / samples;

      // 各円の中心からの距離を計算
      const d1 = Math.sqrt((px - c1.x) ** 2 + (py - c1.y) ** 2);
      const d2 = Math.sqrt((px - c2.x) ** 2 + (py - c2.y) ** 2);
      const d3 = Math.sqrt((px - c3.x) ** 2 + (py - c3.y) ** 2);

      if (d1 <= R && d2 <= R && d3 <= R) {
        count++;
      }
    }
  }

  const gridArea = (2 * range) * (2 * range);
  const threeway = (count / (samples * samples)) * gridArea;

  return threeway;
}

// 目的関数: 2円のみの重なり領域の合計
function objective(d, R) {
  const lens = lensArea(d, R);
  const threeway = threewayArea(d, R);

  // 3つのペアそれぞれについて、「2円のみの重なり」を計算
  const pairwiseOnly = lens - threeway;

  // 3つのペアの合計
  return 3 * pairwiseOnly;
}

// dを変化させて最適値を探す
console.log("d/R\td\tLens Area\t3-way Area\tPairwise Only\tTotal");
console.log("=".repeat(80));

let maxValue = -Infinity;
let optimalD = 0;

for (let ratio = 0.5; ratio <= 2.0; ratio += 0.1) {
  const d = ratio * R;
  const lens = lensArea(d, R);
  const threeway = threewayArea(d, R);
  const pairwise = lens - threeway;
  const total = 3 * pairwise;

  if (total > maxValue) {
    maxValue = total;
    optimalD = d;
  }

  console.log(
    `${ratio.toFixed(2)}\t${d.toFixed(1)}\t${lens.toFixed(1)}\t\t${threeway.toFixed(1)}\t\t${pairwise.toFixed(1)}\t\t${total.toFixed(1)}`
  );
}

console.log("\n" + "=".repeat(80));
console.log(`最適な中心間距離: d = ${optimalD.toFixed(1)} (${(optimalD/R).toFixed(2)}R)`);
console.log(`最大値: ${maxValue.toFixed(1)}`);
console.log(`半径 R = ${R} の場合、d = ${Math.round(optimalD)} が最適`);
