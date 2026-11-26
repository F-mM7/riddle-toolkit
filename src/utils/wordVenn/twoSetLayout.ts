import type { PlaneLayout, VennLayout } from './types';

/**
 * 2集合の平面の円の配置(上下対称に縦に並べる)。
 * 数値は計算スクリプト(リポジトリ外)の出力から機械的に取り込んだもの。数値を手で編集しないこと。
 * 各領域に入る、高さ24(平面図の文字の大きさ)に文字の縁取りと境目の線の分を足した横長の長方形の最大幅のうち、
 * 最も狭いものが広くなるように円の大きさと中心間の距離を決めた。
 * labels の位置は、その長方形の幅が最大になる位置の中心。
 */
const PLANE2: PlaneLayout = {
  kind: 'plane',
  id: 'plane2',
  name: '平面の円',
  setCount: 2,
  viewBox: '40 -74 420 548',
  circles: [
    { cx: 250, cy: 136, r: 180 },
    { cx: 250, cy: 264, r: 180 },
  ],
  labels: {
    1: { x: 250, y: 66.89 },
    2: { x: 250, y: 333.11 },
    3: { x: 250, y: 200 },
  },
};

export const TWO_SET_LAYOUTS: readonly VennLayout[] = [PLANE2];
