import type { NameEntry } from './types';

/**
 * 部分一致検索
 * 入力文字列を部分文字列として含む項目を、一覧の順にすべて返す。空入力なら何も返さない
 */
export function findPartialMatches(query: string, entries: readonly NameEntry[]): NameEntry[] {
  if (query === '') {
    return [];
  }
  return entries.filter((entry) => entry.name.includes(query));
}
