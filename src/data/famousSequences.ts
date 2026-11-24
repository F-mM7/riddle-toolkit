// 「有名シーケンス一覧」用のシーケンス定義
// 干支・曜日・都道府県名・県庁所在地名は既存の配列を参照して作る(名前や並びを書き写さない)

import { CAPITALS_IN_CODE_ORDER, PREFECTURES_IN_CODE_ORDER } from './prefectureCodes';
import { ETO, WEEKDAY, type SequenceItem } from './sequences';

export interface FamousSequenceItem {
  /** 表記(漢字など)。画面には出さないが、英語の対応づけなどに使う */
  display: string;
  /** コピー用の読み(ひらがな、または慣用の仮名) */
  reading: string;
}

/** 縦書きにする語 1 組(1 語が表の 1 列になる) */
export interface VerticalGrid {
  /** 語の種類。読み(かな)か、英字などの語か */
  kind: 'reading' | 'word';
  /** 列ごとの語(左から順に並べる) */
  words: readonly string[];
}

/** 表に付けるコピーボタン 1 つ分の定義 */
export interface CopyTarget {
  /** ボタンの横に出す短い文言 */
  label: string;
  /** 読み上げ用の説明で「〜をコピー」の「〜」に入れる語 */
  description: string;
  /** 表のグリッドごとの列の語(上のグリッドから順。各グリッドは左の列から順)から、コピーする文字列を作る */
  toText: (gridWords: readonly (readonly string[])[]) => string;
}

/**
 * カードの見せ方
 * - table: グリッドを縦書きの表にして見せ、コピーボタンを付ける
 * - copyOnly: 表は見せず、項目名とコピーボタンだけを置く(要素が多く、表にすると長すぎるもの)
 */
export type FamousSequenceView = 'table' | 'copyOnly';

/** 1 つのカードにまとめて見せるシーケンス */
export interface FamousSequence {
  id: string;
  name: string;
  /** カードの見せ方。省略時は table */
  view?: FamousSequenceView;
  /** 表に縦に連結するグリッド(上から順)。列は要素ごとに揃えるため、どのグリッドも要素数が同じ */
  grids: readonly VerticalGrid[];
  /**
   * 表に付けるコピーボタン(左から順)。省略時は、列の語をそのままつなげたものをコピーするボタン 1 つにする
   * (省略できるのはグリッドが 1 つの表だけ)
   */
  copyTargets?: readonly CopyTarget[];
}

/** 対応させる値の数が要素数と一致しなければエラーにする */
function assertSameLength(itemCount: number, valueCount: number, valueName: string): void {
  if (itemCount !== valueCount) {
    throw new Error(`要素数(${itemCount})と${valueName}の数(${valueCount})が一致しません`);
  }
}

/** 読みを持つ既存シーケンスの要素を、読み必須の要素に変換する */
function requireReadings(items: readonly SequenceItem[]): FamousSequenceItem[] {
  return items.map((item) => {
    if (item.reading === undefined) {
      throw new Error(`読みが未定義の要素があります: ${item.display}`);
    }
    return { display: item.display, reading: item.reading };
  });
}

/** 要素の表記に、読みを順に対応づける(要素が元から持つ読みは使わない) */
function attachReadings(
  items: readonly SequenceItem[],
  readings: readonly string[]
): FamousSequenceItem[] {
  assertSameLength(items.length, readings.length, '読み');
  return items.map((item, i) => ({ display: item.display, reading: readings[i] }));
}

/** 要素の読みを列の語にしたグリッドを作る */
function readingGrid(items: readonly FamousSequenceItem[]): VerticalGrid {
  return { kind: 'reading', words: items.map((item) => item.reading) };
}

/** 読み(かな)をそのまま列の語にしたグリッドを作る */
function kanaGrid(readings: readonly string[]): VerticalGrid {
  return { kind: 'reading', words: readings };
}

/** 語(英字など)をそのまま列の語にしたグリッドを作る */
function wordGrid(words: readonly string[]): VerticalGrid {
  return { kind: 'word', words };
}

/** 英語の略称(フル綴りの先頭 3 文字)を作る */
function abbreviate(word: string): string {
  return word.slice(0, 3);
}

/**
 * かなのグリッド(上)と英語のフル綴りのグリッド(下)の表に付ける、
 * かな・英語の略称(先頭 3 文字)・英語のフル綴りの 3 つのコピーボタン
 */
const KANA_ABBREVIATION_AND_FULL_COPY_TARGETS: readonly CopyTarget[] = [
  {
    label: 'かな',
    description: 'かな',
    toText: ([kana]) => kana.join(''),
  },
  {
    label: '英略',
    description: '英語の略称',
    toText: ([, english]) => english.map(abbreviate).join(''),
  },
  {
    label: '英フル',
    description: '英語のフル綴り',
    toText: ([, english]) => english.join(''),
  },
];

/** display が startDisplay の要素が先頭に来るように、並びを保ったまま回す */
function rotateToStart<T extends { display: string }>(
  items: readonly T[],
  startDisplay: string
): T[] {
  const start = items.findIndex((item) => item.display === startDisplay);
  if (start === -1) {
    throw new Error(`先頭にする要素が見つかりません: ${startDisplay}`);
  }
  return [...items.slice(start), ...items.slice(0, start)];
}

/**
 * 要素の表記ごとの値を、要素の並びのとおりに取り出す(並びを二重に持たないため)
 * 値の数が要素数と合わない、または値のない要素があればエラーにする
 */
function valuesByDisplay(
  items: readonly { display: string }[],
  valueOf: Readonly<Record<string, string>>,
  valueName: string
): string[] {
  assertSameLength(items.length, Object.keys(valueOf).length, valueName);
  return items.map((item) => {
    if (!Object.prototype.hasOwnProperty.call(valueOf, item.display)) {
      throw new Error(`${valueName}が未定義の要素があります: ${item.display}`);
    }
    return valueOf[item.display];
  });
}

// 曜日(日曜始まり)。シーケンスとばしの WEEKDAY(月始まり)に読みを付けてから、日曜が先頭になるよう回す
// 読みは WEEKDAY の並び(月始まり)に対応させる
const WEEKDAY_ITEMS = rotateToStart(
  attachReadings(WEEKDAY.items, ['げつ', 'か', 'すい', 'もく', 'きん', 'ど', 'にち']),
  '日'
);

// 曜日の英語(フル綴り)。日曜始まりの曜日の並びから対応させて作る
const WEEKDAY_ENGLISH_WORDS = valuesByDisplay(
  WEEKDAY_ITEMS,
  {
    日: 'SUNDAY',
    月: 'MONDAY',
    火: 'TUESDAY',
    水: 'WEDNESDAY',
    木: 'THURSDAY',
    金: 'FRIDAY',
    土: 'SATURDAY',
  },
  '英語の曜日名'
);

// 表は読みの下にフル綴りを続け、略称はコピーボタンで出す
const WEEKDAYS: FamousSequence = {
  id: 'weekday',
  name: WEEKDAY.name,
  grids: [readingGrid(WEEKDAY_ITEMS), wordGrid(WEEKDAY_ENGLISH_WORDS)],
  copyTargets: KANA_ABBREVIATION_AND_FULL_COPY_TARGETS,
};

// 月の和名(旧暦の和風月名)
const WAFU_GETSUMEI_ITEMS: readonly FamousSequenceItem[] = [
  { display: '睦月', reading: 'むつき' },
  { display: '如月', reading: 'きさらぎ' },
  { display: '弥生', reading: 'やよい' },
  { display: '卯月', reading: 'うづき' },
  { display: '皐月', reading: 'さつき' },
  { display: '水無月', reading: 'みなづき' },
  { display: '文月', reading: 'ふみづき' },
  { display: '葉月', reading: 'はづき' },
  { display: '長月', reading: 'ながつき' },
  { display: '神無月', reading: 'かんなづき' },
  { display: '霜月', reading: 'しもつき' },
  { display: '師走', reading: 'しわす' },
];

// 月の英語(フル綴り)。月の和名の並び(1 月から)から対応させて作る
const MONTH_ENGLISH_WORDS = valuesByDisplay(
  WAFU_GETSUMEI_ITEMS,
  {
    睦月: 'JANUARY',
    如月: 'FEBRUARY',
    弥生: 'MARCH',
    卯月: 'APRIL',
    皐月: 'MAY',
    水無月: 'JUNE',
    文月: 'JULY',
    葉月: 'AUGUST',
    長月: 'SEPTEMBER',
    神無月: 'OCTOBER',
    霜月: 'NOVEMBER',
    師走: 'DECEMBER',
  },
  '英語の月名'
);

// 表は和名の読みの下にフル綴りを続け、略称はコピーボタンで出す。和名と英語の両方を含むので名前は「月」
const MONTHS: FamousSequence = {
  id: 'month',
  name: '月',
  grids: [readingGrid(WAFU_GETSUMEI_ITEMS), wordGrid(MONTH_ENGLISH_WORDS)],
  copyTargets: KANA_ABBREVIATION_AND_FULL_COPY_TARGETS,
};

// 太陽系の惑星(太陽に近い順)
const PLANET_ITEMS: readonly FamousSequenceItem[] = [
  { display: '水星', reading: 'すいせい' },
  { display: '金星', reading: 'きんせい' },
  { display: '地球', reading: 'ちきゅう' },
  { display: '火星', reading: 'かせい' },
  { display: '木星', reading: 'もくせい' },
  { display: '土星', reading: 'どせい' },
  { display: '天王星', reading: 'てんのうせい' },
  { display: '海王星', reading: 'かいおうせい' },
];

// 惑星の略称(水金地火木土天海)の読み。惑星の並びから対応させて作る
// 読みは惑星の読みの先頭からは作れない(ちきゅう→ち など)ため、略称の読みとして別に持つ
const PLANET_ABBREVIATION_READINGS = valuesByDisplay(
  PLANET_ITEMS,
  {
    水星: 'すい',
    金星: 'きん',
    地球: 'ち',
    火星: 'か',
    木星: 'もく',
    土星: 'ど',
    天王星: 'てん',
    海王星: 'かい',
  },
  '惑星の略称の読み'
);

// 表は正式名の読みだけにし、略称の読みはコピーボタンで出す
const PLANETS: FamousSequence = {
  id: 'planets',
  name: '太陽系の惑星',
  grids: [readingGrid(PLANET_ITEMS)],
  copyTargets: [
    {
      label: '略',
      description: '略称',
      toText: () => PLANET_ABBREVIATION_READINGS.join(''),
    },
    {
      label: 'フル',
      description: '正式名',
      toText: ([fullNames]) => fullNames.join(''),
    },
  ],
};

// 春の七草
const NANAKUSA: FamousSequence = {
  id: 'nanakusa',
  name: '春の七草',
  grids: [
    readingGrid([
      { display: '芹', reading: 'せり' },
      { display: '薺', reading: 'なずな' },
      { display: '御形', reading: 'ごぎょう' },
      { display: '繁縷', reading: 'はこべら' },
      { display: '仏の座', reading: 'ほとけのざ' },
      { display: '菘', reading: 'すずな' },
      { display: '蘿蔔', reading: 'すずしろ' },
    ]),
  ],
};

// ドレミのうた(ペギー葉山の訳詞で各音に当てている言葉。ソは「青い空」の「空」)
const DOREMI_SONG: FamousSequence = {
  id: 'doremi-song',
  name: 'ドレミのうた',
  // 表記(漢字・カタカナ)は別に持たず、仮名だけにする
  grids: [kanaGrid(['どーなつ', 'れもん', 'みんな', 'ふぁいと', 'そら', 'らっぱ', 'しあわせ'])],
};

// 虹の色(日本で一般的な7色。外側の赤から)の訓読み
const RAINBOW_ITEMS: readonly FamousSequenceItem[] = [
  { display: '赤', reading: 'あか' },
  { display: '橙', reading: 'だいだい' },
  { display: '黄', reading: 'き' },
  { display: '緑', reading: 'みどり' },
  { display: '青', reading: 'あお' },
  { display: '藍', reading: 'あい' },
  { display: '紫', reading: 'むらさき' },
];

// 虹の色の音読み(せき・とう…)。表記は虹の色のデータから取り、読みを順に対応づける
const RAINBOW_ON_READING_ITEMS = attachReadings(RAINBOW_ITEMS, [
  'せき',
  'とう',
  'おう',
  'りょく',
  'せい',
  'らん',
  'し',
]);

// 表は訓読みの下に音読みを続ける
const RAINBOW: FamousSequence = {
  id: 'rainbow',
  name: '虹の色',
  grids: [readingGrid(RAINBOW_ITEMS), readingGrid(RAINBOW_ON_READING_ITEMS)],
  copyTargets: [
    {
      label: '訓',
      description: '訓読み',
      toText: ([kun]) => kun.join(''),
    },
    {
      label: '音',
      description: '音読み',
      toText: ([, on]) => on.join(''),
    },
  ],
};

// 方角(熟語「東西南北」の順)の英語
const DIRECTION_ENGLISH: FamousSequence = {
  id: 'direction-english',
  name: '方角',
  grids: [wordGrid(['EAST', 'WEST', 'SOUTH', 'NORTH'])],
};

// 四季(春から)の英語。秋は FALL ではなく AUTUMN(謎検の解説の表記に合わせる)
const SEASON_ENGLISH: FamousSequence = {
  id: 'season-english',
  name: '四季',
  grids: [wordGrid(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'])],
};

// 指の名前(親指から小指の順)。「ゆび」は付けない
const FINGERS: FamousSequence = {
  id: 'fingers',
  name: '指の名前',
  grids: [
    readingGrid([
      { display: '親', reading: 'おや' },
      { display: '人差し', reading: 'ひとさし' },
      { display: '中', reading: 'なか' },
      { display: '薬', reading: 'くすり' },
      { display: '小', reading: 'こ' },
    ]),
  ],
};

/** 名前を 1 行に 1 つずつ、改行でつなげたものをコピーするボタン(コピー専用のカード用) */
const LINE_SEPARATED_KANA_COPY_TARGETS: readonly CopyTarget[] = [
  {
    label: 'かな',
    description: 'かな',
    toText: ([names]) => names.join('\n'),
  },
];

// 都道府県名(地方公共団体コード順。北海道から沖縄)。47 件あるので表は見せず、コピーだけにする
const PREFECTURES: FamousSequence = {
  id: 'prefectures',
  name: '都道府県名',
  view: 'copyOnly',
  grids: [kanaGrid(PREFECTURES_IN_CODE_ORDER)],
  copyTargets: LINE_SEPARATED_KANA_COPY_TARGETS,
};

// 県庁所在地名(都道府県名と同じ地方公共団体コード順)。表は見せず、コピーだけにする
const CAPITALS: FamousSequence = {
  id: 'capitals',
  name: '県庁所在地名',
  view: 'copyOnly',
  grids: [kanaGrid(CAPITALS_IN_CODE_ORDER)],
  copyTargets: LINE_SEPARATED_KANA_COPY_TARGETS,
};

export const FAMOUS_SEQUENCES: readonly FamousSequence[] = [
  { id: ETO.id, name: ETO.name, grids: [readingGrid(requireReadings(ETO.items))] },
  WEEKDAYS,
  MONTHS,
  PLANETS,
  NANAKUSA,
  DOREMI_SONG,
  RAINBOW,
  DIRECTION_ENGLISH,
  SEASON_ENGLISH,
  FINGERS,
  PREFECTURES,
  CAPITALS,
];
