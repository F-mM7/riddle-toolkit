import { KOGAKI_MAP } from '../../data/kana';
import { hiraganaToKatakana } from '../kanaVisualizer/kanaUtils';

// 共有の対応表(ひらがな)にない小字を補う
const EXTRA_KOGAKI_MAP: Record<string, string> = {
  ゕ: 'か',
  ゖ: 'け',
};

// 小字 → 大きい字の対応表(ひらがな・カタカナ)
const ENLARGE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries({ ...KOGAKI_MAP, ...EXTRA_KOGAKI_MAP }).flatMap(([small, large]) => [
    [small, large],
    [hiraganaToKatakana(small), hiraganaToKatakana(large)],
  ])
);

/**
 * 文字列中の小字を対応する大きい字に直す(文字数は変わらない)
 */
export function enlargeKogaki(text: string): string {
  return Array.from(text, (char) => ENLARGE_MAP[char] ?? char).join('');
}
