import { TOOL_GENRES, TOOLS } from '../../types/tools';
import { ToolCard } from './ToolCard';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.home}>
      {TOOL_GENRES.map((genre) => {
        const tools = TOOLS.filter((tool) => tool.genre === genre.id);
        if (tools.length === 0) return null;
        return (
          <section key={genre.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{genre.name}</h2>
            <div className={styles.grid}>
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  name={tool.name}
                  description={tool.description}
                  path={tool.path}
                  icon={tool.icon}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
