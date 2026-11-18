import { joinPicked, MISSING_CHAR } from '../../utils/charPicker/charPicker';
import { PickedChar } from '../../utils/charPicker/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  results: PickedChar[];
}

// 改行・空白など見えにくい文字を記号に置き換えて表示する
const VISIBLE_SUBSTITUTES: Record<string, string> = {
  '\n': '↵',
  '\r': '␍',
  '\t': '⇥',
  ' ': '␣',
  '\u3000': '□',
};

function toVisible(char: string): string {
  return VISIBLE_SUBSTITUTES[char] ?? char;
}

export function ResultDisplay({ results }: ResultDisplayProps) {
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>番号を入力してください</p>
      </div>
    );
  }

  const joined = joinPicked(results);
  const invalidTokens = results.filter((r) => r.status === 'invalid').map((r) => r.token.raw);
  const outOfRangeTokens = results.filter((r) => r.status === 'outOfRange').map((r) => r.token.raw);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.joined} aria-label={joined}>
        {results.map((result, i) =>
          result.char === null ? (
            <span key={i} className={styles.missing}>
              {MISSING_CHAR}
            </span>
          ) : (
            <span key={i} className={styles.joinedChar}>
              {toVisible(result.char)}
            </span>
          )
        )}
      </div>
      {outOfRangeTokens.length > 0 && (
        <p className={styles.warning}>
          範囲外の番号（{MISSING_CHAR} で表示）: {outOfRangeTokens.join(', ')}
        </p>
      )}
      {invalidTokens.length > 0 && (
        <p className={styles.warning}>
          数値として解釈できない入力（{MISSING_CHAR} で表示）: {invalidTokens.join(', ')}
        </p>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.headerRow}>
              <th className={styles.rowLabel} scope="row">
                番号
              </th>
              {results.map((result, i) => (
                <td key={`index-${i}`} className={styles.cell}>
                  <span
                    className={
                      result.status === 'ok'
                        ? styles.number
                        : result.status === 'outOfRange'
                          ? styles.numberOutOfRange
                          : styles.numberInvalid
                    }
                  >
                    {result.token.raw}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <th className={styles.rowLabel} scope="row">
                文字
              </th>
              {results.map((result, i) => (
                <td key={`char-${i}`} className={styles.cell}>
                  {result.char === null ? (
                    <span className={styles.missing}>{MISSING_CHAR}</span>
                  ) : (
                    <span className={styles.char}>{toVisible(result.char)}</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
