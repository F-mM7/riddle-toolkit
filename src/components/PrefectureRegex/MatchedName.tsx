import type { ListKind } from '../../utils/prefectureRegex/types';
import { ListBadge } from './ListBadge';
import styles from './ResultDisplay.module.css';

interface MatchedNameProps {
  name: string;
  list: ListKind;
  showList: boolean;
}

// 結果の名前1件。一覧のラベルを名前の前に置き、行ごとにラベルの位置がそろうようにする
export function MatchedName({ name, list, showList }: MatchedNameProps) {
  return (
    <span className={styles.matchedName}>
      {showList && <ListBadge list={list} />}
      <span className={styles.matchedValue}>{name}</span>
    </span>
  );
}
