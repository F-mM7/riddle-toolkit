/**
 * ベン図の各領域の文字
 */
export interface VennRegions {
  only1: string; // 単語1のみ
  only2: string; // 単語2のみ
  only3: string; // 単語3のみ
  intersect12: string; // 単語1と単語2の共通
  intersect13: string; // 単語1と単語3の共通
  intersect23: string; // 単語2と単語3の共通
  intersectAll: string; // 3つ全ての共通
}
