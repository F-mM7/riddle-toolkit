// 都道府県名・県庁所在地名(regions.ts のひらがなの配列)を、地方公共団体コード(都道府県コード 01〜47)の順に並べ替える
// 名前の一覧は regions.ts のものを使い、ここでは名前からコードへの対応だけを持つ
// コードの順は、総務省「全国地方公共団体コード」(https://www.soumu.go.jp/denshijiti/code.html)による

import { capitals, prefectures } from './regions';

/** 都道府県の数(地方公共団体コードの都道府県コード 01〜47) */
const PREFECTURE_COUNT = 47;

/** 都道府県名(regions.ts のひらがな表記)から都道府県コードへの対応 */
const PREFECTURE_CODES: Readonly<Record<string, number>> = {
  ほっかいどう: 1,
  あおもり: 2,
  いわて: 3,
  みやぎ: 4,
  あきた: 5,
  やまがた: 6,
  ふくしま: 7,
  いばらき: 8,
  とちぎ: 9,
  ぐんま: 10,
  さいたま: 11,
  ちば: 12,
  とうきょう: 13,
  かながわ: 14,
  にいがた: 15,
  とやま: 16,
  いしかわ: 17,
  ふくい: 18,
  やまなし: 19,
  ながの: 20,
  ぎふ: 21,
  しずおか: 22,
  あいち: 23,
  みえ: 24,
  しが: 25,
  きょうと: 26,
  おおさか: 27,
  ひょうご: 28,
  なら: 29,
  わかやま: 30,
  とっとり: 31,
  しまね: 32,
  おかやま: 33,
  ひろしま: 34,
  やまぐち: 35,
  とくしま: 36,
  かがわ: 37,
  えひめ: 38,
  こうち: 39,
  ふくおか: 40,
  さが: 41,
  ながさき: 42,
  くまもと: 43,
  おおいた: 44,
  みやざき: 45,
  かごしま: 46,
  おきなわ: 47,
};

/** 県庁所在地名(regions.ts のひらがな表記)から、その都道府県の都道府県コードへの対応 */
const CAPITAL_CODES: Readonly<Record<string, number>> = {
  さっぽろ: 1,
  あおもり: 2,
  もりおか: 3,
  せんだい: 4,
  あきた: 5,
  やまがた: 6,
  ふくしま: 7,
  みと: 8,
  うつのみや: 9,
  まえばし: 10,
  さいたま: 11,
  ちば: 12,
  とうきょう: 13,
  よこはま: 14,
  にいがた: 15,
  とやま: 16,
  かなざわ: 17,
  ふくい: 18,
  こうふ: 19,
  ながの: 20,
  ぎふ: 21,
  しずおか: 22,
  なごや: 23,
  つ: 24,
  おおつ: 25,
  きょうと: 26,
  おおさか: 27,
  こうべ: 28,
  なら: 29,
  わかやま: 30,
  とっとり: 31,
  まつえ: 32,
  おかやま: 33,
  ひろしま: 34,
  やまぐち: 35,
  とくしま: 36,
  たかまつ: 37,
  まつやま: 38,
  こうち: 39,
  ふくおか: 40,
  さが: 41,
  ながさき: 42,
  くまもと: 43,
  おおいた: 44,
  みやざき: 45,
  かごしま: 46,
  なは: 47,
};

/**
 * 名前の一覧を、名前ごとのコードの順に並べ替える
 * 名前が 47 件でない・重複している・コードがない、またはコードが 01〜47 と 1 対 1 に対応しなければエラーにする
 */
function sortByCode(
  names: readonly string[],
  codeOf: Readonly<Record<string, number>>,
  listName: string
): string[] {
  if (names.length !== PREFECTURE_COUNT) {
    throw new Error(`${listName}の数(${names.length})が ${PREFECTURE_COUNT} ではありません`);
  }
  if (Object.keys(codeOf).length !== names.length) {
    throw new Error(
      `${listName}のコードの数(${Object.keys(codeOf).length})が名前の数(${names.length})と一致しません`
    );
  }
  const byCode = new Map<number, string>();
  for (const name of names) {
    if (!Object.prototype.hasOwnProperty.call(codeOf, name)) {
      throw new Error(`${listName}にコードが未定義の名前があります: ${name}`);
    }
    const code = codeOf[name];
    if (!Number.isInteger(code) || code < 1 || code > PREFECTURE_COUNT) {
      throw new Error(`${listName}のコードが範囲外です: ${name}(${code})`);
    }
    const existing = byCode.get(code);
    if (existing !== undefined) {
      throw new Error(`${listName}のコード ${code} が重複しています: ${existing}、${name}`);
    }
    byCode.set(code, name);
  }
  return Array.from({ length: PREFECTURE_COUNT }, (_, i) => {
    const name = byCode.get(i + 1);
    if (name === undefined) {
      throw new Error(`${listName}にコード ${i + 1} の名前がありません`);
    }
    return name;
  });
}

/** 都道府県名(ひらがな)。地方公共団体コード順(北海道から沖縄) */
export const PREFECTURES_IN_CODE_ORDER: readonly string[] = sortByCode(
  prefectures,
  PREFECTURE_CODES,
  '都道府県名'
);

/** 県庁所在地名(ひらがな)。都道府県名と同じ地方公共団体コード順(n 番目は都道府県名の n 番目の県庁所在地) */
export const CAPITALS_IN_CODE_ORDER: readonly string[] = sortByCode(
  capitals,
  CAPITAL_CODES,
  '県庁所在地名'
);
