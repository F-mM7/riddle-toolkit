import type { ConditionId, Shape, Turn } from '../../utils/mazeHelper/types';

/** 条件ごとの表示名と強調色(並びは判定ロジックの条件順と同じ) */
export const CONDITION_STYLES: Record<ConditionId, { label: string; color: string }> = {
  multiple: { label: 'nの倍数', color: '#FBBF24' },
  straight: { label: '直進', color: '#34D399' },
  left: { label: '左折', color: '#60A5FA' },
  right: { label: '右折', color: '#F472B6' },
  horizontal: { label: '─', color: '#F87171' },
  vertical: { label: '│', color: '#A78BFA' },
  downRight: { label: '┌', color: '#FB923C' },
  downLeft: { label: '┐', color: '#22D3EE' },
  upRight: { label: '└', color: '#A3E635' },
  upLeft: { label: '┘', color: '#E879F9' },
};

/** 曲がり方の条件(ボタンの並び順) */
export const TURN_IDS: Turn[] = ['straight', 'left', 'right'];

/** 線の形の条件(ボタンの並び順) */
export const SHAPE_IDS: Shape[] = [
  'horizontal',
  'vertical',
  'downRight',
  'downLeft',
  'upRight',
  'upLeft',
];

/** すべての条件(判定ロジックの条件順) */
export const CONDITION_IDS: ConditionId[] = ['multiple', ...TURN_IDS, ...SHAPE_IDS];

/** すべての条件を同じ値で埋めた表 */
export function fillConditions<T>(value: T): Record<ConditionId, T> {
  return Object.fromEntries(CONDITION_IDS.map((id) => [id, value])) as Record<ConditionId, T>;
}
