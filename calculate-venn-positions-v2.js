// ベン図の各領域の文字表示位置を正しく計算
// 2円のみの重なり = 2円の交点を結ぶ弦の外側（3円の重心から遠い側）

const circles = [
  { cx: 250, cy: 165, r: 120, name: '円1' },
  { cx: 190, cy: 269, r: 120, name: '円2' },
  { cx: 310, cy: 269, r: 120, name: '円3' },
];

const R = 120;

// 2円の交点を計算
function findCircleIntersections(c1, c2) {
  const dx = c2.cx - c1.cx;
  const dy = c2.cy - c1.cy;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > c1.r + c2.r || d < Math.abs(c1.r - c2.r) || d === 0) {
    return null;
  }

  const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
  const px = c1.cx + (dx * a) / d;
  const py = c1.cy + (dy * a) / d;
  const h = Math.sqrt(c1.r * c1.r - a * a);

  const i1 = {
    x: px + (h * dy) / d,
    y: py - (h * dx) / d,
  };
  const i2 = {
    x: px - (h * dy) / d,
    y: py + (h * dx) / d,
  };

  return { i1, i2, midpoint: { x: px, y: py } };
}

// 3円の重心
function calculateCentroid(c1, c2, c3) {
  return {
    x: (c1.cx + c2.cx + c3.cx) / 3,
    y: (c1.cy + c2.cy + c3.cy) / 3,
  };
}

// 点p1からp2方向に距離dist進んだ点
function moveTowards(p1, p2, dist) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return {
    x: p1.x + (dx / len) * dist,
    y: p1.y + (dy / len) * dist,
  };
}

// 点pから方向dirに距離dist進んだ点
function moveInDirection(p, dir, dist) {
  const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
  return {
    x: p.x + (dir.x / len) * dist,
    y: p.y + (dir.y / len) * dist,
  };
}

console.log('=== ベン図の文字表示位置の正しい計算 ===\n');

const centroid = calculateCentroid(circles[0], circles[1], circles[2]);
console.log(`3円の重心: (${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)})\n`);

// 円1と円2の交点
const int12 = findCircleIntersections(circles[0], circles[1]);
// 2つの交点のうち、重心から遠い方を選ぶ
const dist1_to_centroid = Math.sqrt((int12.i1.x - centroid.x) ** 2 + (int12.i1.y - centroid.y) ** 2);
const dist2_to_centroid = Math.sqrt((int12.i2.x - centroid.x) ** 2 + (int12.i2.y - centroid.y) ** 2);
const far12 = dist1_to_centroid > dist2_to_centroid ? int12.i1 : int12.i2;

// 円1と円3の交点
const int13 = findCircleIntersections(circles[0], circles[2]);
const dist1_to_centroid_13 = Math.sqrt((int13.i1.x - centroid.x) ** 2 + (int13.i1.y - centroid.y) ** 2);
const dist2_to_centroid_13 = Math.sqrt((int13.i2.x - centroid.x) ** 2 + (int13.i2.y - centroid.y) ** 2);
const far13 = dist1_to_centroid_13 > dist2_to_centroid_13 ? int13.i1 : int13.i2;

// 円2と円3の交点
const int23 = findCircleIntersections(circles[1], circles[2]);
const dist1_to_centroid_23 = Math.sqrt((int23.i1.x - centroid.x) ** 2 + (int23.i1.y - centroid.y) ** 2);
const dist2_to_centroid_23 = Math.sqrt((int23.i2.x - centroid.x) ** 2 + (int23.i2.y - centroid.y) ** 2);
const far23 = dist1_to_centroid_23 > dist2_to_centroid_23 ? int23.i1 : int23.i2;

console.log('重心から遠い交点（2円のみの重なり領域の代表点）:');
console.log(`  円1-円2: (${far12.x.toFixed(1)}, ${far12.y.toFixed(1)})`);
console.log(`  円1-円3: (${far13.x.toFixed(1)}, ${far13.y.toFixed(1)})`);
console.log(`  円2-円3: (${far23.x.toFixed(1)}, ${far23.y.toFixed(1)})`);

console.log('\n=== 各領域の表示位置 ===\n');

// intersect12: 重心から遠い交点から、さらに重心と反対方向に少し移動
const dir12 = { x: far12.x - centroid.x, y: far12.y - centroid.y };
const intersect12 = moveInDirection(far12, dir12, 20);
console.log(`intersect12: { x: ${Math.round(intersect12.x)}, y: ${Math.round(intersect12.y)} }`);

const dir13 = { x: far13.x - centroid.x, y: far13.y - centroid.y };
const intersect13 = moveInDirection(far13, dir13, 20);
console.log(`intersect13: { x: ${Math.round(intersect13.x)}, y: ${Math.round(intersect13.y)} }`);

const dir23 = { x: far23.x - centroid.x, y: far23.y - centroid.y };
const intersect23 = moveInDirection(far23, dir23, 20);
console.log(`intersect23: { x: ${Math.round(intersect23.x)}, y: ${Math.round(intersect23.y)} }`);

// only領域: 各円の中心から、他の2円の中心の平均点と反対方向に0.7R
const only1_direction = {
  x: circles[0].cx - (circles[1].cx + circles[2].cx) / 2,
  y: circles[0].cy - (circles[1].cy + circles[2].cy) / 2,
};
const only1 = moveInDirection({ x: circles[0].cx, y: circles[0].cy }, only1_direction, R * 0.7);
console.log(`only1: { x: ${Math.round(only1.x)}, y: ${Math.round(only1.y)} }`);

const only2_direction = {
  x: circles[1].cx - (circles[0].cx + circles[2].cx) / 2,
  y: circles[1].cy - (circles[0].cy + circles[2].cy) / 2,
};
const only2 = moveInDirection({ x: circles[1].cx, y: circles[1].cy }, only2_direction, R * 0.7);
console.log(`only2: { x: ${Math.round(only2.x)}, y: ${Math.round(only2.y)} }`);

const only3_direction = {
  x: circles[2].cx - (circles[0].cx + circles[1].cx) / 2,
  y: circles[2].cy - (circles[0].cy + circles[1].cy) / 2,
};
const only3 = moveInDirection({ x: circles[2].cx, y: circles[2].cy }, only3_direction, R * 0.7);
console.log(`only3: { x: ${Math.round(only3.x)}, y: ${Math.round(only3.y)} }`);

console.log(`intersectAll: { x: ${Math.round(centroid.x)}, y: ${Math.round(centroid.y)} }`);

console.log('\n=== TypeScript用コード ===\n');
console.log(`const textPositions = {
  only1: { x: ${Math.round(only1.x)}, y: ${Math.round(only1.y)} },
  only2: { x: ${Math.round(only2.x)}, y: ${Math.round(only2.y)} },
  only3: { x: ${Math.round(only3.x)}, y: ${Math.round(only3.y)} },
  intersect12: { x: ${Math.round(intersect12.x)}, y: ${Math.round(intersect12.y)} },
  intersect13: { x: ${Math.round(intersect13.x)}, y: ${Math.round(intersect13.y)} },
  intersect23: { x: ${Math.round(intersect23.x)}, y: ${Math.round(intersect23.y)} },
  intersectAll: { x: ${Math.round(centroid.x)}, y: ${Math.round(centroid.y)} },
};`);
