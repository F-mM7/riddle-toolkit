import type {
  ActiveConditions,
  Cell,
  ConditionId,
  Direction,
  FirstNumber,
  Shape,
  Turn,
} from './types';

export const isSameCell = (a: Cell, b: Cell): boolean => a.row === b.row && a.col === b.col;

/** 上下左右に隣接しているか */
export const isAdjacent = (a: Cell, b: Cell): boolean =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;

/**
 * 経路を1マスなぞった結果を返す。
 * - 経路が空ならそのマスを始点にする
 * - 末尾と同じマスなら変化なし
 * - 末尾の1つ前のマスなら末尾を1マス取り消す
 * - 末尾に上下左右で隣接し、未訪問のマスなら追加する
 * - それ以外(斜め・飛び・再訪)は無視する
 */
export function extendPath(path: readonly Cell[], cell: Cell): Cell[] {
  if (path.length === 0) return [cell];
  const last = path[path.length - 1];
  if (isSameCell(last, cell)) return [...path];
  if (path.length >= 2 && isSameCell(path[path.length - 2], cell)) return path.slice(0, -1);
  if (!isAdjacent(last, cell)) return [...path];
  if (path.some((c) => isSameCell(c, cell))) return [...path];
  return [...path, cell];
}

/**
 * prev → cur → next と進んだときの cur での曲がり方を、盤面を上から見た進行方向基準で返す。
 * 行は下向き、列は右向きに増える座標系で判定する。
 */
export function getTurn(prev: Cell, cur: Cell, next: Cell): Turn {
  const d1 = { row: cur.row - prev.row, col: cur.col - prev.col };
  const d2 = { row: next.row - cur.row, col: next.col - cur.col };
  const cross = d1.col * d2.row - d1.row * d2.col;
  if (cross > 0) return 'right';
  if (cross < 0) return 'left';
  return 'straight';
}

/** 経路の各マスの曲がり方。始点・終点(前後のマスがないもの)は null */
export function getTurns(path: readonly Cell[]): (Turn | null)[] {
  return path.map((cell, i) =>
    i === 0 || i === path.length - 1 ? null : getTurn(path[i - 1], cell, path[i + 1])
  );
}

/** from から見た、上下左右に隣接する to の向き。隣接していなければエラー */
export function getDirection(from: Cell, to: Cell): Direction {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr === -1 && dc === 0) return 'up';
  if (dr === 1 && dc === 0) return 'down';
  if (dr === 0 && dc === -1) return 'left';
  if (dr === 0 && dc === 1) return 'right';
  throw new Error(`隣接していないマスです: (${from.row},${from.col}) → (${to.row},${to.col})`);
}

/** 経路の各マスから、経路上でつながる前後のマスへの向き(始点・終点は1つ、1マスだけなら空) */
export function getConnections(path: readonly Cell[]): Direction[][] {
  return path.map((cell, i) => {
    const dirs: Direction[] = [];
    if (i > 0) dirs.push(getDirection(cell, path[i - 1]));
    if (i < path.length - 1) dirs.push(getDirection(cell, path[i + 1]));
    return dirs;
  });
}

/** 2方向の組み合わせから線の形を返す。同じ向き2つなど形にならなければエラー */
export function getShapeFromDirections(a: Direction, b: Direction): Shape {
  const has = (d: Direction) => a === d || b === d;
  if (has('left') && has('right')) return 'horizontal';
  if (has('up') && has('down')) return 'vertical';
  if (has('down') && has('right')) return 'downRight';
  if (has('down') && has('left')) return 'downLeft';
  if (has('up') && has('right')) return 'upRight';
  if (has('up') && has('left')) return 'upLeft';
  throw new Error(`線の形になりません: ${a}, ${b}`);
}

/** 経路の各マスの線の形。始点・終点(つながる向きが1つ以下のもの)は null */
export function getShapes(path: readonly Cell[]): (Shape | null)[] {
  return getConnections(path).map((dirs) =>
    dirs.length === 2 ? getShapeFromDirections(dirs[0], dirs[1]) : null
  );
}

/** 通し番号 position が n の倍数か(n は1以上の整数。0 も倍数として扱う) */
export const isMultipleOf = (position: number, n: number): boolean =>
  Number.isInteger(n) && n >= 1 && position % n === 0;

/** 経路の i 番目(0始まりの添字)のマスの通し番号 */
export const getPositionNumber = (index: number, firstNumber: FirstNumber): number =>
  index + firstNumber;

/**
 * 経路の各マスが該当する条件の一覧
 * (条件の並びは multiple, straight, left, right, 線の形の順)
 */
export function matchConditions(
  path: readonly Cell[],
  conditions: ActiveConditions
): ConditionId[][] {
  const turns = getTurns(path);
  const shapes = getShapes(path);
  return path.map((_, i) => {
    const matched: ConditionId[] = [];
    if (
      conditions.multipleOf !== null &&
      isMultipleOf(getPositionNumber(i, conditions.firstNumber), conditions.multipleOf)
    ) {
      matched.push('multiple');
    }
    const turn = turns[i];
    if (turn !== null && conditions[turn]) matched.push(turn);
    const shape = shapes[i];
    if (shape !== null && conditions[shape]) matched.push(shape);
    return matched;
  });
}

/**
 * 経路の各マスが、ハイライトされたマス(該当条件が1つ以上あるマス)の中で何番目に通るか。
 * 1 始まりで、ハイライトされていないマスは null。
 * matches は matchConditions の結果(有効な条件だけで判定済み)を渡す。
 */
export function getHighlightOrder(matches: readonly (readonly ConditionId[])[]): (number | null)[] {
  let order = 0;
  return matches.map((ids) => {
    if (ids.length === 0) return null;
    order += 1;
    return order;
  });
}
