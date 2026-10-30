// あみだくじソルバー: 横線1本分の情報
export interface Rung {
  id: number;
  left: number; // 左側の縦線インデックス（0始まり）。left と left+1 を結ぶ
  y: number; // 高さ（0=上端, 1=下端 の正規化座標）
}

// 文字を指定する側
export type AmidaDirection = 'top' | 'bottom';

// 横線追加の可否判定結果
export type RungCheckResult = { ok: true } | { ok: false; reason: 'out-of-range' | 'too-close' };
