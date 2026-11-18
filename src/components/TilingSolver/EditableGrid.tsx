import { useMemo, useState } from 'react';
import type { PointerEvent } from 'react';
import { ColorGrid } from './ColorGrid';
import styles from './EditableGrid.module.css';

/** [行, 列](src/utils/tilingSolver/types.ts の Cell と同じ形) */
type Cell = [number, number];

type EditableGridProps = {
  /** 1マスの最大の大きさ(px)。コンテナが狭いときは縮む */
  cellSize: number;
  rows: number;
  cols: number;
  /** 選択済みマスの色(CSS の色) */
  color: string;
  selectedCells: Cell[];
  onChange: (cells: Cell[]) => void;
  'aria-label'?: string;
};

type Drag = {
  pointerId: number;
  start: Cell;
  current: Cell;
  /** 起点マスが選択済みなら矩形を消去、未選択なら矩形を追加する */
  removing: boolean;
};

const keyOf = (r: number, c: number) => `${r},${c}`;

function rectCells(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = [];
  for (let r = Math.min(a[0], b[0]); r <= Math.max(a[0], b[0]); r++) {
    for (let c = Math.min(a[1], b[1]); c <= Math.max(a[1], b[1]); c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

export function EditableGrid({
  cellSize,
  rows,
  cols,
  color,
  selectedCells,
  onChange,
  'aria-label': ariaLabel,
}: EditableGridProps) {
  const [drag, setDrag] = useState<Drag | null>(null);

  const selectedSet = useMemo(
    () => new Set(selectedCells.map(([r, c]) => keyOf(r, c))),
    [selectedCells]
  );

  const colorMap = useMemo(() => {
    const map: (string | null)[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (selectedSet.has(keyOf(r, c)) ? color : null))
    );
    if (drag) {
      for (const [r, c] of rectCells(drag.start, drag.current)) {
        map[r][c] = drag.removing ? null : color;
      }
    }
    return map;
  }, [rows, cols, color, selectedSet, drag]);

  /** グリッド本体の矩形を基準に、ポインタ位置のマスを求める(範囲外は null) */
  const cellAt = (e: PointerEvent<HTMLDivElement>): Cell | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
  };

  /** ドラッグ中はグリッド外に出ても端のマスに丸める */
  const clampedCellAt = (e: PointerEvent<HTMLDivElement>): Cell | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    return [Math.min(rows - 1, Math.max(0, r)), Math.min(cols - 1, Math.max(0, c))];
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || drag) return;
    const cell = cellAt(e);
    if (!cell) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      pointerId: e.pointerId,
      start: cell,
      current: cell,
      removing: selectedSet.has(keyOf(cell[0], cell[1])),
    });
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const cell = clampedCellAt(e);
    if (!cell || (cell[0] === drag.current[0] && cell[1] === drag.current[1])) return;
    setDrag({ ...drag, current: cell });
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const rectSet = new Set(rectCells(drag.start, drag.current).map(([r, c]) => keyOf(r, c)));
    const inRange = ([r, c]: Cell) => r >= 0 && r < rows && c >= 0 && c < cols;
    let next: Cell[];
    if (drag.removing) {
      next = selectedCells.filter(([r, c]) => !rectSet.has(keyOf(r, c)));
    } else {
      next = [...selectedCells];
      for (const key of rectSet) {
        if (!selectedSet.has(key)) {
          const [r, c] = key.split(',').map(Number);
          next.push([r, c]);
        }
      }
    }
    setDrag(null);
    onChange(next.filter(inRange));
  };

  /** 中断されたドラッグは確定せずに破棄する */
  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    setDrag(null);
  };

  return (
    <ColorGrid
      rows={rows}
      cols={cols}
      colorMap={colorMap}
      maxCellSize={cellSize}
      className={styles.editable}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    />
  );
}
