import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../../types/tools';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // 現在のパスに対応するツール名を取得
  const currentTool = TOOLS.find(tool => tool.path === location.pathname);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isHome ? (
            'riddle-toolkit'
          ) : (
            <>
              <Link to="/" className={styles.homeLink}>
                riddle-toolkit
              </Link>
              {currentTool && (
                <>
                  <span className={styles.separator}> / </span>
                  <span className={styles.pageName}>{currentTool.name}</span>
                </>
              )}
            </>
          )}
        </h1>
        {!isHome && (
          <Link to="/" className={styles.backButton}>
            ← ホームへ戻る
          </Link>
        )}
      </div>
    </header>
  );
}
