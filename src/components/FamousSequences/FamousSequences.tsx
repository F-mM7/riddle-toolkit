import { FAMOUS_SEQUENCES, type VerticalGrid } from '../../data/famousSequences';
import { toCopyActions, toStackedRows } from '../../utils/famousSequences/famousSequences';
import { CopyButton } from '../AmidaSolver/CopyButton';
import styles from './FamousSequences.module.css';

/** コピー対象の指定がない表で、コピーボタンの横に出す文言(グリッドの語の種類ごと) */
const COPY_LABELS: Record<VerticalGrid['kind'], string> = {
  reading: 'かな',
  word: '英字',
};

// 表示内容は定数から決まるので、描画のたびに作り直さない
const TABLES = FAMOUS_SEQUENCES.map((sequence) => ({
  id: sequence.id,
  name: sequence.name,
  headingId: `famous-sequence-${sequence.id}`,
  // 各グリッドの語を 1 列にして縦に 1 文字ずつ並べ、グリッドを上から順に連結する。短い語の下側は空のセル
  // コピー専用のカードは表を見せないので作らない
  rows: (sequence.view ?? 'table') === 'table' ? toStackedRows(sequence) : null,
  copyActions: toCopyActions(sequence, COPY_LABELS),
}));

interface CopyActionProps {
  /** 何をコピーするかを示す、ボタンの横の文言 */
  label: string;
  text: string;
  /** コピーする文字列の文字数。ボタンの横に出す */
  charCount: number;
  /** 読み上げ用の説明。見える文言を含める */
  ariaLabel: string;
}

/** 何をコピーするかを示す文言と、コピーする文字列の文字数と、コピーボタンの組 */
function CopyAction({ label, text, charCount, ariaLabel }: CopyActionProps) {
  return (
    <span className={styles.copyAction}>
      <span aria-hidden="true">{label}</span>
      <span className={styles.copyButtonWithCount}>
        <span className={styles.charCount} aria-hidden="true">
          {charCount}文字
        </span>
        <CopyButton text={text} label={ariaLabel} />
      </span>
    </span>
  );
}

export function FamousSequences() {
  return (
    <div className={styles.container}>
      {/* 各表へのページ内リンク。カードの id(データの id)へハッシュで跳ぶ */}
      <nav className={styles.toc} aria-label="表の一覧">
        {TABLES.map((table) => (
          <a key={table.id} href={`#${table.id}`} className={styles.tocLink}>
            {table.name}
          </a>
        ))}
      </nav>
      {TABLES.map((table) => (
        <section
          key={table.id}
          id={table.id}
          className={styles.card}
          aria-labelledby={table.headingId}
        >
          <h2 id={table.headingId} className={styles.name}>
            {table.name}
          </h2>
          {/* 列が多い表は、ページ全体ではなくこの中だけ横にスクロールさせる */}
          {table.rows && (
            <div className={styles.scroll}>
              <table className={styles.table} aria-labelledby={table.headingId}>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    // グリッドの境目は、下のグリッドの先頭の行の上罫線を太くするだけ(見た目の装飾)
                    <tr key={rowIndex} className={row.startsGrid ? styles.gridStart : undefined}>
                      {row.cells.map((value, col) => (
                        <td key={col} className={styles.cell}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className={styles.copyActions}>
            {table.copyActions.map((action) => (
              <CopyAction
                key={action.label}
                label={action.label}
                text={action.text}
                charCount={action.charCount}
                ariaLabel={`${table.name}の${action.description}(${action.charCount}文字)をコピー`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
