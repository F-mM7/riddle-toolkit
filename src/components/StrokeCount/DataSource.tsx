import styles from './DataSource.module.css';

/**
 * 漢字の画数データの出典表示(ライセンスが画面に求めるものだけ)
 * - EDRDG ライセンス第3節: 画面ごとに使用と出典(KANJIDIC2・EDRDG)を示し、説明とライセンスへリンクする
 * - CC BY-SA 4.0 の 3(a)(1)(B)・3(b)(2): 加工したことと、加工後のデータのライセンスを示す
 * 著作権表示・無保証の定めはリンク先のライセンス文書にあるので、3(a)(2) に基づきリンクで示す。
 * 版などの詳細はデータファイル(src/data/kanjiStrokeCounts.ts)の冒頭コメントに書く
 */
export function DataSource() {
  return (
    <footer className={styles.container}>
      <p className={styles.text}>
        <a
          href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
          target="_blank"
          rel="noopener noreferrer"
        >
          KANJIDIC2
        </a>
        (
        <a
          href="https://www.edrdg.org/edrdg/licence.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          EDRDG
        </a>
        ,{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 4.0
        </a>
        )を加工
      </p>
    </footer>
  );
}
