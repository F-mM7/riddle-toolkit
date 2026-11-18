import { MIN_WIDTH, type WrappedGrid } from '../../utils/lineWrapper/lineWrapper';
import styles from './GridList.module.css';

interface GridListProps {
  grids: WrappedGrid[];
  charCount: number;
}

export function GridList({ grids, charCount }: GridListProps) {
  if (grids.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>
          {charCount === 0
            ? '文字列を入力してください'
            : `${MIN_WIDTH + 1}文字以上入力してください`}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.list}>
        {grids.map((grid) => (
          <section key={grid.width} className={styles.card}>
            <h4 className={styles.cardTitle}>{grid.width}文字ごと</h4>
            <div className={styles.gridScroll}>
              <div
                className={styles.grid}
                style={{ gridTemplateColumns: `repeat(${grid.width}, var(--cell-size))` }}
              >
                {grid.rows.flatMap((row, rowIndex) =>
                  row.map((char, colIndex) => (
                    <span key={`${rowIndex}-${colIndex}`} className={styles.cell}>
                      {char}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
