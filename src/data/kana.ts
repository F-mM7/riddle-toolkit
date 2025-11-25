// 清音46文字（あ〜ん）
export const SEION: readonly string[] = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
] as const;

// 濁音マッピング（濁音 → 清音）
export const DAKUON_MAP: Record<string, string> = {
  'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
  'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
  'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
  'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
};

// 半濁音マッピング（半濁音 → 清音）
export const HANDAKUON_MAP: Record<string, string> = {
  'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
};

// 小字マッピング（小字 → 清音）
export const KOGAKI_MAP: Record<string, string> = {
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
  'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
  'ゎ': 'わ', 'っ': 'つ',
};

// 清音から濁音への逆マッピング
export const SEION_TO_DAKUON: Record<string, string> =
  Object.fromEntries(
    Object.entries(DAKUON_MAP).map(([dakuon, seion]) => [seion, dakuon])
  );

// 清音から半濁音への逆マッピング
export const SEION_TO_HANDAKUON: Record<string, string> =
  Object.fromEntries(
    Object.entries(HANDAKUON_MAP).map(([handakuon, seion]) => [seion, handakuon])
  );

// 清音から小字への逆マッピング
export const SEION_TO_KOGAKI: Record<string, string> =
  Object.fromEntries(
    Object.entries(KOGAKI_MAP).map(([kogaki, seion]) => [seion, kogaki])
  );

// いろは順（「ん」無し47字）
export const IROHA_47: readonly string[] = [
  'い', 'ろ', 'は', 'に', 'ほ', 'へ', 'と',
  'ち', 'り', 'ぬ', 'る', 'を', 'わ', 'か',
  'よ', 'た', 'れ', 'そ', 'つ', 'ね', 'な',
  'ら', 'む', 'う', 'ゐ', 'の', 'お', 'く',
  'や', 'ま', 'け', 'ふ', 'こ', 'え', 'て',
  'あ', 'さ', 'き', 'ゆ', 'め', 'み', 'し',
  'ゑ', 'ひ', 'も', 'せ', 'す',
] as const;

// いろは順（「ん」有り48字）
export const IROHA_48: readonly string[] = [
  'い', 'ろ', 'は', 'に', 'ほ', 'へ', 'と',
  'ち', 'り', 'ぬ', 'る', 'を', 'わ', 'か',
  'よ', 'た', 'れ', 'そ', 'つ', 'ね', 'な',
  'ら', 'む', 'う', 'ゐ', 'の', 'お', 'く',
  'や', 'ま', 'け', 'ふ', 'こ', 'え', 'て',
  'あ', 'さ', 'き', 'ゆ', 'め', 'み', 'し',
  'ゑ', 'ひ', 'も', 'せ', 'す', 'ん',
] as const;

// アルファベット26文字（小文字）
export const ALPHABET: readonly string[] = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g',
  'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u',
  'v', 'w', 'x', 'y', 'z',
] as const;
