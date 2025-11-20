import { TOOLS } from '../../types/tools';
import { ToolCard } from './ToolCard';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.grid}>
        {TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            name={tool.name}
            description={tool.description}
            path={tool.path}
            icon={tool.icon}
          />
        ))}
      </div>
    </div>
  );
}
