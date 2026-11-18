import { colorSet } from '../../utils/tilingSolver/colorSet';
import { normalize, placementCells } from '../../utils/tilingSolver/solver';
import type { Cell, Piece, Solution, SolveResult } from '../../utils/tilingSolver/types';
import { ColorGrid } from './ColorGrid';
import styles from './SolutionView.module.css';

/** 結果グリッド1つの最大の大きさ(px) */
const GRID_MAX_SIZE = 256;

type SolutionViewProps = {
  /** Solve を押した時点の盤面 */
  board: readonly Cell[];
  /** Solve を押した時点のピース形状(スナップショット) */
  pieces: readonly Piece[];
  solution: Solution;
  /** 読み上げ用の解の番号(1始まり) */
  number: number;
};

/** 1つの解を、ピースごとに色分けしたグリッドとして描く */
export function SolutionView({ board, pieces, solution, number }: SolutionViewProps) {
  // 解の座標は盤面を正規化した座標なので、グリッドの寸法も正規化した盤面から決める
  const normalizedBoard = normalize(board);
  const rows = Math.max(0, ...normalizedBoard.map(([r]) => r + 1));
  const cols = Math.max(0, ...normalizedBoard.map(([, c]) => c + 1));
  const colors = colorSet(pieces.length);

  const colorMap: (string | null)[][] = Array.from({ length: rows }, () =>
    Array<string | null>(cols).fill(null)
  );
  for (const placement of solution) {
    const piece = pieces[placement.pieceIndex];
    if (piece === undefined) {
      throw new Error(`解が存在しないピース番号を参照しています: ${placement.pieceIndex}`);
    }
    for (const [r, c] of placementCells(piece, placement)) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) {
        throw new Error(`解のマスが盤面の範囲外です: [${r}, ${c}]`);
      }
      colorMap[r][c] = colors[placement.pieceIndex];
    }
  }

  return (
    <ColorGrid
      rows={rows}
      cols={cols}
      colorMap={colorMap}
      maxCellSize={GRID_MAX_SIZE / Math.max(rows, cols, 1)}
      role="img"
      aria-label={`解${number}`}
      className={styles.grid}
    />
  );
}

type SolutionListProps = {
  /** Solve を押した時点の盤面 */
  board: readonly Cell[];
  /** Solve を押した時点のピース形状(スナップショット) */
  pieces: readonly Piece[];
  /** まだ Solve していなければ null */
  result: SolveResult | null;
  isSolving: boolean;
  /** 解の上限件数(打ち切りの表示に使う) */
  maxSolutions: number;
};

/** 解の件数・打ち切りの有無と、解の一覧を表示する */
export function SolutionList({
  board,
  pieces,
  result,
  isSolving,
  maxSolutions,
}: SolutionListProps) {
  const solutionCount = result?.solutions.length ?? 0;

  return (
    <section className={styles.container} aria-busy={isSolving}>
      <div className={styles.header}>
        <h2 className={styles.title}>解</h2>
        {!isSolving && result !== null && solutionCount > 0 && (
          <span className={styles.count}>
            {solutionCount}件{result.truncated && '(打ち切り)'}
          </span>
        )}
      </div>

      {isSolving && (
        <p className={styles.message} role="status">
          計算中...
        </p>
      )}

      {!isSolving && result === null && (
        <p className={styles.message}>「解く」ボタンを押すと解が表示されます</p>
      )}

      {!isSolving && result !== null && solutionCount === 0 && (
        <p className={styles.message} role="status">
          解が見つかりませんでした
        </p>
      )}

      {!isSolving && result !== null && result.truncated && (
        <p className={styles.notice} role="status">
          解が{maxSolutions}件を超えたため、最初の{solutionCount}件で打ち切りました
        </p>
      )}

      {!isSolving && result !== null && solutionCount > 0 && (
        <ul className={styles.list}>
          {result.solutions.map((solution, index) => (
            <li key={index} className={styles.item}>
              <SolutionView board={board} pieces={pieces} solution={solution} number={index + 1} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
