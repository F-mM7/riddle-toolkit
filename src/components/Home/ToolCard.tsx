import { Link } from 'react-router-dom';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  name: string;
  description: string;
  path: string;
}

export function ToolCard({ name, description, path }: ToolCardProps) {
  return (
    <Link to={path} className={styles.card}>
      <h3 className={styles.title}>{name}</h3>
      <p className={styles.description}>{description}</p>
      <span className={styles.button}>開始 →</span>
    </Link>
  );
}
