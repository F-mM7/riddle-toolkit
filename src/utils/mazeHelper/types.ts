/** 盤面上のマス(0始まり) */
export interface Cell {
  row: number;
  col: number;
}

/** 隣のマスへの向き(盤面を上から見たときの上下左右) */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 経路途中のマスでの曲がり方 */
export type Turn = 'straight' | 'left' | 'right';

/**
 * 経路途中のマスでの線の形。
 * horizontal: ─ / vertical: │ / downRight: ┌ / downLeft: ┐ / upRight: └ / upLeft: ┘
 */
export type Shape = 'horizontal' | 'vertical' | 'downRight' | 'downLeft' | 'upRight' | 'upLeft';

/** ハイライト条件の種類 */
export type ConditionId = 'multiple' | Turn | Shape;

/** 経路の最初のマスに振る番号 */
export type FirstNumber = 0 | 1;

/** 有効になっている条件 */
export type ActiveConditions = {
  /** 通し番号が n の倍数のマスを強調する(null なら無効) */
  multipleOf: number | null;
  /** 通し番号の始まり(0 なら最初のマスが 0 番で、0 は n の倍数として扱う) */
  firstNumber: FirstNumber;
} & Record<Turn | Shape, boolean>;
