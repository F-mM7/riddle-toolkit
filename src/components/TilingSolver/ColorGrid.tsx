import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import styles from './ColorGrid.module.css';

type ColorGridProps = {
  rows: number;
  cols: number;
  /** colorMap[行][列] に CSS の色を入れる。null は空きマス */
  colorMap: (string | null)[][];
  /** 1マスの最大の大きさ(px)。コンテナが狭いときはこれより小さくなる */
  maxCellSize: number;
  ref?: Ref<HTMLDivElement>;
} & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'>;

export function ColorGrid({
  rows,
  cols,
  colorMap,
  maxCellSize,
  ref,
  className,
  ...rest
}: ColorGridProps) {
  const style = {
    '--rows': rows,
    '--cols': cols,
    '--max-cell-size': `${maxCellSize}px`,
  } as CSSProperties;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = colorMap[r]?.[c] ?? null;
      cells.push(
        <div
          key={`${r},${c}`}
          className={styles.cell}
          style={color === null ? undefined : { backgroundColor: color }}
        />
      );
    }
  }

  return (
    <div
      ref={ref}
      className={className ? `${styles.grid} ${className}` : styles.grid}
      style={style}
      {...rest}
    >
      {cells}
    </div>
  );
}
