// ベン図の2円のみの重なり領域を最大化する距離を計算

const R = 120; // 半径

// 2円の重なり面積（レンズ型）
function lensArea(d, R) {
  if (d >= 2 * R) return 0;
  if (d <= 0) return Math.PI * R * R;

  const acos = Math.acos(d / (2 * R));
  const sqrt = Math.sqrt(4 * R * R - d * d);
  return 2 * R * R * acos - (d / 2) * sqrt;
}

// 3円の重なり領域の面積（Reuleaux三角形的な領域）
// 正三角形配置で中心間距離がdの場合
function threewayArea(d, R) {
  // 3円が重なる条件: R > d/√3
  const h = d / Math.sqrt(3); // 重心から頂点までの距離

  if (R <= h) return 0; // 3円が重ならない

  // 正三角形の各頂点から、円が作る弧で囲まれた領域
  // より正確な計算:
  // 各円のペアの交点を求め、それらが作る三角形領域を計算

  // 簡略化: 3つの円弧が囲む領域
  // これは複雑なので、数値積分または幾何学的計算が必要

  // 近似式を使用（正確な計算は複雑）
  // 各円が正三角形の中心領域に寄与する扇形から、三角形を引いた面積の和

  // 2円の交点間の距離を計算
  const chordLength = Math.sqrt(4 * R * R - d * d);

  // 各円のペアが作る交点
  // これらの交点が作る領域を計算するのは複雑

  // より簡単な近似: 3つのレンズの重なりから推定
  // 実際には、正確な幾何計算が必要

  // ここでは、モンテカルロ法的なアプローチまたは公式を使用
  // 3円の重なり領域の近似公式:

  if (d >= 2 * R) return 0;

  // 正三角形配置での3円重なり面積の近似
  // 各円の中心角を計算
  const alpha = 2 * Math.asin(chordLength / (2 * R));

  // 3つの扇形が重なる領域
  // 簡易計算: 各扇形の面積から三角形部分を引く
  const sectorArea = 0.5 * R * R * alpha;
  const triangleArea = 0.5 * R * R * Math.sin(alpha);
  const segmentArea = sectorArea - triangleArea;

  // 3つのセグメントが作る領域（近似）
  // 実際にはもっと複雑だが、簡易的に
  const approxArea = Math.max(0, 3 * segmentArea - lensArea(d, R));

  return approxArea;
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

for (let ratio = 0.5; ratio <= 2.0; ratio += 0.05) {
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
