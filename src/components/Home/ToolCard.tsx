import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './ToolCard.module.css';

/** 半角文字(英数字・記号)が全角文字に対して占める幅のおおよその比率 */
const HALF_WIDTH_RATIO = 0.6;

/**
 * ツール名の表示幅を全角1文字=1として見積もる。
 * カード幅に収まるよう文字の大きさを決めるのに使う。
 */
function estimateTitleWidth(name: string): number {
  return Array.from(name).reduce(
    (sum, char) => sum + (/[\u0020-\u007e]/.test(char) ? HALF_WIDTH_RATIO : 1),
    0
  );
}

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
      <h3
        className={styles.title}
        style={{ '--title-width': estimateTitleWidth(name) } as CSSProperties}
      >
        {name}
      </h3>
    </Link>
  );
}
