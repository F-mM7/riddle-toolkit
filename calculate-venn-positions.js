// ベン図の各領域の文字表示位置を幾何学的に計算

// 円の設定
const circles = [
  { cx: 250, cy: 165, r: 120, name: '円1' },
  { cx: 190, cy: 269, r: 120, name: '円2' },
  { cx: 310, cy: 269, r: 120, name: '円3' },
];

const R = 120; // 半径

// 2円の交点を計算する関数
function findCircleIntersections(c1, c2) {
  const dx = c2.cx - c1.cx;
  const dy = c2.cy - c1.cy;
  const d = Math.sqrt(dx * dx + dy * dy);

  // 交点が存在しない場合
  if (d > c1.r + c2.r || d < Math.abs(c1.r - c2.r) || d === 0) {
    return null;
  }

  // 2円の中心を結ぶ線分上で、c1からの距離a
  const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);

  // 線分上の点
  const px = c1.cx + (dx * a) / d;
  const py = c1.cy + (dy * a) / d;

  // 線分に垂直な方向の距離h
  const h = Math.sqrt(c1.r * c1.r - a * a);

  // 2つの交点
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

// 3円の重心を計算
function calculateCentroid(c1, c2, c3) {
  return {
    x: (c1.cx + c2.cx + c3.cx) / 3,
    y: (c1.cy + c2.cy + c3.cy) / 3,
  };
}

// 2点間の中点を計算
function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

// 点p1からp2に向かってratio分進んだ点
function interpolate(p1, p2, ratio) {
  return {
    x: p1.x + (p2.x - p1.x) * ratio,
    y: p1.y + (p2.y - p1.y) * ratio,
  };
}

console.log('=== ベン図の文字表示位置の計算 ===\n');

// 3円の重心
const centroid = calculateCentroid(circles[0], circles[1], circles[2]);
console.log(`3円の重心: (${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)})\n`);

// 円1と円2の交点
const int12 = findCircleIntersections(circles[0], circles[1]);
console.log('円1と円2の交点:');
console.log(`  交点1: (${int12.i1.x.toFixed(1)}, ${int12.i1.y.toFixed(1)})`);
console.log(`  交点2: (${int12.i2.x.toFixed(1)}, ${int12.i2.y.toFixed(1)})`);
console.log(`  中点: (${int12.midpoint.x.toFixed(1)}, ${int12.midpoint.y.toFixed(1)})`);

// 円1と円3の交点
const int13 = findCircleIntersections(circles[0], circles[2]);
console.log('\n円1と円3の交点:');
console.log(`  交点1: (${int13.i1.x.toFixed(1)}, ${int13.i1.y.toFixed(1)})`);
console.log(`  交点2: (${int13.i2.x.toFixed(1)}, ${int13.i2.y.toFixed(1)})`);
console.log(`  中点: (${int13.midpoint.x.toFixed(1)}, ${int13.midpoint.y.toFixed(1)})`);

// 円2と円3の交点
const int23 = findCircleIntersections(circles[1], circles[2]);
console.log('\n円2と円3の交点:');
console.log(`  交点1: (${int23.i1.x.toFixed(1)}, ${int23.i1.y.toFixed(1)})`);
console.log(`  交点2: (${int23.i2.x.toFixed(1)}, ${int23.i2.y.toFixed(1)})`);
console.log(`  中点: (${int23.midpoint.x.toFixed(1)}, ${int23.midpoint.y.toFixed(1)})`);

console.log('\n=== 各領域の表示位置（幾何学的に計算）===\n');

// intersect12: 2つの交点の中点から、重心と反対方向に少し移動
// 重心から見て外側に配置
const intersect12_base = midpoint(int12.i1, int12.i2);
// 重心から交点中点への方向ベクトルを延長
const intersect12 = interpolate(centroid, intersect12_base, 1.3);
console.log(`intersect12: { x: ${Math.round(intersect12.x)}, y: ${Math.round(intersect12.y)} }`);

const intersect13_base = midpoint(int13.i1, int13.i2);
const intersect13 = interpolate(centroid, intersect13_base, 1.3);
console.log(`intersect13: { x: ${Math.round(intersect13.x)}, y: ${Math.round(intersect13.y)} }`);

const intersect23_base = midpoint(int23.i1, int23.i2);
const intersect23 = interpolate(centroid, intersect23_base, 1.3);
console.log(`intersect23: { x: ${Math.round(intersect23.x)}, y: ${Math.round(intersect23.y)} }`);

// only1: 円1の中心から、他の円の中心と反対方向
const only1_direction = {
  x: circles[0].cx - (circles[1].cx + circles[2].cx) / 2,
  y: circles[0].cy - (circles[1].cy + circles[2].cy) / 2,
};
const only1_len = Math.sqrt(only1_direction.x ** 2 + only1_direction.y ** 2);
const only1 = {
  x: circles[0].cx + (only1_direction.x / only1_len) * (R * 0.7),
  y: circles[0].cy + (only1_direction.y / only1_len) * (R * 0.7),
};
console.log(`only1: { x: ${Math.round(only1.x)}, y: ${Math.round(only1.y)} }`);

// only2: 円2の中心から、他の円の中心と反対方向
const only2_direction = {
  x: circles[1].cx - (circles[0].cx + circles[2].cx) / 2,
  y: circles[1].cy - (circles[0].cy + circles[2].cy) / 2,
};
const only2_len = Math.sqrt(only2_direction.x ** 2 + only2_direction.y ** 2);
const only2 = {
  x: circles[1].cx + (only2_direction.x / only2_len) * (R * 0.7),
  y: circles[1].cy + (only2_direction.y / only2_len) * (R * 0.7),
};
console.log(`only2: { x: ${Math.round(only2.x)}, y: ${Math.round(only2.y)} }`);

// only3: 円3の中心から、他の円の中心と反対方向
const only3_direction = {
  x: circles[2].cx - (circles[0].cx + circles[1].cx) / 2,
  y: circles[2].cy - (circles[0].cy + circles[1].cy) / 2,
};
const only3_len = Math.sqrt(only3_direction.x ** 2 + only3_direction.y ** 2);
const only3 = {
  x: circles[2].cx + (only3_direction.x / only3_len) * (R * 0.7),
  y: circles[2].cy + (only3_direction.y / only3_len) * (R * 0.7),
};
console.log(`only3: { x: ${Math.round(only3.x)}, y: ${Math.round(only3.y)} }`);

// intersectAll: 3円の重心
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
