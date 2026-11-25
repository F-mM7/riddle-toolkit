/** 添字は所属する集合のビットマスク(単語 i を含めばビット i)。長さ 2^n、0番は常に '' */
export type RegionTexts = string[];
export interface Circle {
  cx: number;
  cy: number;
  r: number;
}
/** maxR: その位置で領域の内側に入る円の半径(文字サイズ調整用) */
export interface LabelPos {
  x: number;
  y: number;
  maxR: number;
}
interface LayoutBase {
  id: string; // 例 'plane3', 'replica4-cross', 'replica5-outer'
  name: string; // 切り替えUIに出す日本語名 例 'はみ出し'
  setCount: number;
  viewBox: string; // 'minX minY w h'
  circles: Circle[]; // 長さ setCount。順番は単語の順(ビット順)
  labels: Record<number, LabelPos>; // マスク 1..2^n-1 すべて
}
export interface PlaneLayout extends LayoutBase {
  kind: 'plane';
}
/** 集合 set(単語の番号 0 始まり)の円のコピー */
export interface CopyCircle extends Circle {
  set: number;
}
/** 中央の円(circles、添字=集合)と、不足する領域を補うコピー(copies)で描く配置。
 *  集合 i の形 = circles[i] と set===i の copies の和集合。 */
export interface ReplicaLayout extends LayoutBase {
  kind: 'replica';
  copies: CopyCircle[];
  /** 円形の外枠。あればこの円で図を切り取り、外側は黒の半透明の膜で薄める。無ければ切り取らない */
  frameCircle?: Circle;
}
export type VennLayout = PlaneLayout | ReplicaLayout;
