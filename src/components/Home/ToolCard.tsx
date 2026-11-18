import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  name: string;
  path: string;
  icon: LucideIcon;
}

export function ToolCard({ name, path, icon: Icon }: ToolCardProps) {
  return (
    <Link to={path} className={styles.card} target="_blank" rel="noopener noreferrer">
      <div className={styles.icon}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{name}</h3>
    </Link>
  );
}
