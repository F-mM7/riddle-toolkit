import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export function ToolCard({ name, description, path, icon: Icon }: ToolCardProps) {
  return (
    <Link to={path} className={styles.card}>
      <div className={styles.icon}>
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{name}</h3>
      <p className={styles.description}>{description}</p>
    </Link>
  );
}
