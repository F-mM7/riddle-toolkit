import { useRef, type CSSProperties, type PointerEvent } from 'react';
import type { Cell, ConditionId, Direction } from '../../utils/mazeHelper/types';
import { CONDITION_STYLES } from './conditions';
import styles from './MazeBoard.module.css';

/** 経路上のマスの描画情報 */
export interface PathCellInfo {
  /** 通し番号(最初のマスの番号の設定に従う) */
  number: number;
  /** 経路上でつながる前後のマスへの向き */
  directions: Direction[];
  /** 始点・終点の印 */
  endpoint: 'start' | 'end' | null;
  /** ハイライトされたマスの中で何番目に通るか(1始まり。ハイライトされていなければ null) */
  highlightOrder: number | null;
}

interface MazeBoardProps {
  rows: number;
  cols: number;
  /** マスごとの経路情報(経路外は null)。[row][col] */
  pathCells: (PathCellInfo | null)[][];
  /** マスごとの該当条件。[row][col] */
  matches: ConditionId[][][];
  onTrace: (cell: Cell) => void;
}

/** 盤面の1辺の目安ピクセル数(マスの大きさの上限はこれを長辺のマス数で割って決める) */
const BOARD_PIXELS = 520;
const MAX_CELL_PIXELS = 48;

const ARM_CLASS: Record<Direction, string> = {
  up: styles.armUp,
  down: styles.armDown,
  left: styles.armLeft,
  right: styles.armRight,
};

/** 該当した条件の色を等分した背景。1つなら単色、複数なら斜めの縞にする */
function conditionBackground(ids: ConditionId[]): string | undefined {
  if (ids.length === 0) return undefined;
  const colors = ids.map((id) => CONDITION_STYLES[id].color);
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  const stops = colors.map((c, i) => `${c} ${i * step}%, ${c} ${(i + 1) * step}%`);
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

/** ポインタ位置にあるマスを返す(タッチ時のポインタキャプチャに影響されないよう座標から引く) */
function cellFromPoint(x: number, y: number): Cell | null {
  const el = document.elementFromPoint(x, y);
  const cellEl = el instanceof Element ? el.closest<HTMLElement>('[data-row]') : null;
  if (!cellEl) return null;
  const row = Number(cellEl.dataset.row);
  const col = Number(cellEl.dataset.col);
  if (Number.isNaN(row) || Number.isNaN(col)) return null;
  return { row, col };
}

/** なぞって経路を描く盤面 */
export function MazeBoard({ rows, cols, pathCells, matches, onTrace }: MazeBoardProps) {
  const isTracing = useRef(false);
  const lastKey = useRef<string | null>(null);

  const traceAt = (x: number, y: number) => {
    const cell = cellFromPoint(x, y);
    if (!cell) return;
    const key = `${cell.row},${cell.col}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    onTrace(cell);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isTracing.current = true;
    lastKey.current = null;
    traceAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isTracing.current) return;
    traceAt(e.clientX, e.clientY);
  };

  const endTrace = () => {
    isTracing.current = false;
    lastKey.current = null;
  };

  // マスの大きさの上限。実際の大きさは CSS で利用可能な幅に収まるよう縮める
  const maxCellSize = Math.min(MAX_CELL_PIXELS, Math.floor(BOARD_PIXELS / Math.max(rows, cols)));

  return (
    <div
      className={styles.board}
      style={
        {
          '--cols': cols,
          '--max-cell-size': `${maxCellSize}px`,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endTrace}
      onPointerCancel={endTrace}
      role="grid"
      aria-label="迷路の盤面"
    >
      {pathCells.map((rowCells, r) =>
        rowCells.map((info, c) => {
          const ids = matches[r][c];
          const background = conditionBackground(ids);
          const className = [
            styles.cell,
            info ? styles.onPath : '',
            ids.length > 0 ? styles.matched : '',
          ]
            .filter(Boolean)
            .join(' ');
          const conditionNames = ids.map((id) => CONDITION_STYLES[id].label).join('・');
          const highlightOrder = info?.highlightOrder ?? null;
          const endpointName =
            info?.endpoint === 'start' ? ' 始点' : info?.endpoint === 'end' ? ' 終点' : '';
          return (
            <div
              key={`${r}-${c}`}
              className={className}
              data-row={r}
              data-col={c}
              style={
                background ? ({ background, '--cell-bg': background } as CSSProperties) : undefined
              }
              role="gridcell"
              aria-label={
                info
                  ? `${r + 1}行${c + 1}列 ${info.number}番${endpointName}${conditionNames ? ` ${conditionNames}` : ''}${highlightOrder !== null ? ` ハイライト${highlightOrder}番目` : ''}`
                  : `${r + 1}行${c + 1}列`
              }
              title={conditionNames || undefined}
            >
              {info && info.directions.length > 0 && (
                <span className={styles.hub} aria-hidden="true" />
              )}
              {info?.directions.map((dir) => (
                <span key={dir} className={`${styles.arm} ${ARM_CLASS[dir]}`} aria-hidden="true" />
              ))}
              {info && (info.endpoint !== null || info.directions.length === 0) && (
                <span
                  className={`${styles.marker} ${info.endpoint === 'end' ? styles.markerEnd : styles.markerStart}`}
                  aria-hidden="true"
                />
              )}
              {highlightOrder !== null && (
                <span
                  className={`${styles.order} ${highlightOrder >= 100 ? styles.orderLong : ''}`}
                  aria-hidden="true"
                >
                  {highlightOrder}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
