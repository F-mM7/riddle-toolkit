import { ConvertedChar } from '../../utils/numberToChar/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  results: ConvertedChar[];
}

interface RowConfig {
  key: 'gojuon' | 'iroha' | 'alphabet';
  label: string;
}

const ROWS: RowConfig[] = [
  { key: 'gojuon', label: '50音順' },
  { key: 'iroha', label: 'いろは順' },
  { key: 'alphabet', label: 'アルファベット' },
];

export function ResultDisplay({ results }: ResultDisplayProps) {
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>数字を入力してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.headerRow}>
              <th className={styles.rowLabel} scope="row">
                入力
              </th>
              {results.map((result, i) => (
                <td key={`input-${i}`} className={styles.cell}>
                  <span
                    className={
                      result.token.isInvalid
                        ? styles.numberInvalid
                        : styles.number
                    }
                  >
                    {result.token.raw}
                  </span>
                </td>
              ))}
            </tr>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th className={styles.rowLabel} scope="row">
                  {row.label}
                </th>
                {results.map((result, i) => {
                  const char = result[row.key];
                  return (
                    <td key={`${row.key}-${i}`} className={styles.cell}>
                      {char === null ? (
                        <span className={styles.empty}>-</span>
                      ) : (
                        <span className={styles.char}>{char}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
