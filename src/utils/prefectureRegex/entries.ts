import type { ListKind, NameEntry, SearchTarget } from './types';

function toEntries(names: readonly string[], list: ListKind): NameEntry[] {
  return names.map((name) => ({ name, list }));
}

/**
 * 検索の対象に応じた項目の一覧を作る
 * 両方のときは、都道府県名の一覧の後に県庁所在地名の一覧を続ける
 */
export function buildEntries(
  target: SearchTarget,
  prefectures: readonly string[],
  capitals: readonly string[]
): NameEntry[] {
  switch (target) {
    case 'prefecture':
      return toEntries(prefectures, 'prefecture');
    case 'capital':
      return toEntries(capitals, 'capital');
    case 'both':
      return [...toEntries(prefectures, 'prefecture'), ...toEntries(capitals, 'capital')];
  }
}
