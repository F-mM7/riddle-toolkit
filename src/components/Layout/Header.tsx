import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isHome ? (
            'riddle-toolkit'
          ) : (
            <Link to="/" className={styles.homeLink}>
              riddle-toolkit
            </Link>
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
