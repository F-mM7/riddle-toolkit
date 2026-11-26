import type { ListKind } from '../../utils/prefectureRegex/types';
import styles from './ListBadge.module.css';

const LIST_LABELS: Record<ListKind, string> = {
  prefecture: '都道府県',
  capital: '県庁所在地',
};

interface ListBadgeProps {
  list: ListKind;
}

// 名前がどちらの一覧のものかを示すラベル（対象が両方のときに使う）
export function ListBadge({ list }: ListBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${list === 'prefecture' ? styles.prefecture : styles.capital}`}
    >
      {LIST_LABELS[list]}
    </span>
  );
}
