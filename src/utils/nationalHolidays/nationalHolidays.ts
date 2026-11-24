// 国民の祝日に関する法律(祝日法)と、その年限りの休日を定めた法律に基づいて、年ごとの休日を求める

import type { Holiday, HolidayKind, YearParseResult } from './types';

/**
 * 対応する最初の年
 * 祝日法は 1948 年 7 月 20 日の施行で、1948 年は年の途中からしか祝日がないため、1 年を通して祝日法がある 1949 年から
 */
export const MIN_YEAR = 1949;

/** 対応する最後の年。春分日・秋分日の計算式が有効な 2099 年まで */
export const MAX_YEAR = 2099;

/**
 * 春分日・秋分日が官報で公表済みの最後の年
 * 春分日・秋分日は前年 2 月に国立天文台の暦要項として公表される。これより後の年は計算による推定になる
 */
export const LAST_ANNOUNCED_YEAR = 2027;

/** 振替休日の始まり(1973 年 4 月 12 日施行の改正) */
const SUBSTITUTE_START = { year: 1973, month: 4, day: 12 };
/** 振替休日が「翌日」から「その日後で最も近い祝日でない日」に変わった年(2007 年施行の改正) */
const SUBSTITUTE_NEAREST_START_YEAR = 2007;
/** 国民の休日の始まり(1985 年 12 月 27 日施行の改正。その後の最初の該当日は 1988 年 5 月 4 日) */
const CITIZENS_HOLIDAY_START = { year: 1985, month: 12, day: 27 };
/** 国民の休日から日曜日・振替休日を除く規定がなくなった年(2007 年施行の改正) */
const CITIZENS_HOLIDAY_REVISED_YEAR = 2007;

/** 祝日の名前と読み */
interface HolidayName {
  name: string;
  reading: string;
}

const GANJITSU: HolidayName = { name: '元日', reading: 'がんじつ' };
const SEIJIN: HolidayName = { name: '成人の日', reading: 'せいじんのひ' };
const KENKOKU: HolidayName = { name: '建国記念の日', reading: 'けんこくきねんのひ' };
const TENNO_TANJOBI: HolidayName = { name: '天皇誕生日', reading: 'てんのうたんじょうび' };
const SHUNBUN: HolidayName = { name: '春分の日', reading: 'しゅんぶんのひ' };
const MIDORI: HolidayName = { name: 'みどりの日', reading: 'みどりのひ' };
const SHOWA: HolidayName = { name: '昭和の日', reading: 'しょうわのひ' };
const KENPO: HolidayName = { name: '憲法記念日', reading: 'けんぽうきねんび' };
const KODOMO: HolidayName = { name: 'こどもの日', reading: 'こどものひ' };
const UMI: HolidayName = { name: '海の日', reading: 'うみのひ' };
const YAMA: HolidayName = { name: '山の日', reading: 'やまのひ' };
const KEIRO: HolidayName = { name: '敬老の日', reading: 'けいろうのひ' };
const SHUBUN: HolidayName = { name: '秋分の日', reading: 'しゅうぶんのひ' };
const TAIIKU: HolidayName = { name: '体育の日', reading: 'たいいくのひ' };
const SPORTS: HolidayName = { name: 'スポーツの日', reading: 'すぽーつのひ' };
const BUNKA: HolidayName = { name: '文化の日', reading: 'ぶんかのひ' };
const KINRO: HolidayName = { name: '勤労感謝の日', reading: 'きんろうかんしゃのひ' };

const SUBSTITUTE_NAME: HolidayName = { name: '振替休日', reading: 'ふりかえきゅうじつ' };
const CITIZENS_NAME: HolidayName = { name: '国民の休日', reading: 'こくみんのきゅうじつ' };

/** その年限りの法律で休日とされた日 */
interface SpecialHoliday extends HolidayName {
  year: number;
  month: number;
  day: number;
  /**
   * 法律で「国民の祝日とみなす」とされたか
   * みなされた日は、振替休日と国民の休日の判定で国民の祝日として扱う(2019 年の 2 日)
   */
  treatedAsNational: boolean;
}

const SPECIAL_HOLIDAYS: readonly SpecialHoliday[] = [
  {
    year: 1959,
    month: 4,
    day: 10,
    name: '結婚の儀',
    reading: 'けっこんのぎ',
    treatedAsNational: false,
  },
  {
    year: 1989,
    month: 2,
    day: 24,
    name: '大喪の礼',
    reading: 'たいそうのれい',
    treatedAsNational: false,
  },
  {
    year: 1990,
    month: 11,
    day: 12,
    name: '即位礼正殿の儀',
    reading: 'そくいれいせいでんのぎ',
    treatedAsNational: false,
  },
  {
    year: 1993,
    month: 6,
    day: 9,
    name: '結婚の儀',
    reading: 'けっこんのぎ',
    treatedAsNational: false,
  },
  {
    year: 2019,
    month: 5,
    day: 1,
    name: '即位の日',
    reading: 'そくいのひ',
    treatedAsNational: true,
  },
  {
    year: 2019,
    month: 10,
    day: 22,
    name: '即位礼正殿の儀',
    reading: 'そくいれいせいでんのぎ',
    treatedAsNational: true,
  },
];

/** 年内の日を 1 月 1 日からの通し番号(0 始まり)で表す。月をまたぐ前後の日を扱いやすくするため */
function dayOfYear(year: number, month: number, day: number): number {
  return (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000;
}

function dateOf(year: number, index: number): { month: number; day: number; weekday: number } {
  const date = new Date(Date.UTC(year, 0, 1 + index));
  return { month: date.getUTCMonth() + 1, day: date.getUTCDate(), weekday: date.getUTCDay() };
}

function weekdayOf(year: number, index: number): number {
  return dateOf(year, index).weekday;
}

function daysInYear(year: number): number {
  return dayOfYear(year, 12, 31) + 1;
}

/** その月の第 n 月曜日の日 */
function nthMonday(year: number, month: number, n: number): number {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const firstMonday = 1 + ((8 - firstWeekday) % 7);
  return firstMonday + 7 * (n - 1);
}

/**
 * 春分日・秋分日の近似式(1900〜2099 年で有効)
 * 日 = floor(定数 + 0.242194 × (年 − 1980) − floor((年 − 1980) / 4))
 * 1980 年より前と後で定数が変わる
 */
function equinoxDay(year: number, constants: { before1980: number; from1980: number }): number {
  const constant = year < 1980 ? constants.before1980 : constants.from1980;
  return Math.floor(constant + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function vernalEquinoxDay(year: number): number {
  return equinoxDay(year, { before1980: 20.8357, from1980: 20.8431 });
}

function autumnalEquinoxDay(year: number): number {
  return equinoxDay(year, { before1980: 23.2588, from1980: 23.2488 });
}

interface BaseHoliday extends HolidayName {
  month: number;
  day: number;
  kind: Extract<HolidayKind, 'national' | 'special'>;
  /** 振替休日と国民の休日の判定で、国民の祝日として扱うか */
  countsAsNational: boolean;
}

/** その年の国民の祝日(第 2 条)を、年ごとの改正と特例を反映して返す */
function nationalHolidaysOf(year: number): { month: number; day: number; holiday: HolidayName }[] {
  const list: { month: number; day: number; holiday: HolidayName }[] = [];
  const add = (month: number, day: number, holiday: HolidayName) =>
    list.push({ month, day, holiday });

  add(1, 1, GANJITSU);
  add(1, year < 2000 ? 15 : nthMonday(year, 1, 2), SEIJIN);
  if (year >= 1967) add(2, 11, KENKOKU);
  if (year >= 2020) add(2, 23, TENNO_TANJOBI);
  add(3, vernalEquinoxDay(year), SHUNBUN);
  if (year <= 1988) add(4, 29, TENNO_TANJOBI);
  else if (year <= 2006) add(4, 29, MIDORI);
  else add(4, 29, SHOWA);
  add(5, 3, KENPO);
  if (year >= 2007) add(5, 4, MIDORI);
  add(5, 5, KODOMO);

  // 2020・2021 年は東京オリンピック・パラリンピックの特別措置法で、海の日・スポーツの日・山の日が移った
  if (year === 2020) {
    add(7, 23, UMI);
    add(7, 24, SPORTS);
    add(8, 10, YAMA);
  } else if (year === 2021) {
    add(7, 22, UMI);
    add(7, 23, SPORTS);
    add(8, 8, YAMA);
  } else {
    if (year >= 1996 && year <= 2002) add(7, 20, UMI);
    else if (year >= 2003) add(7, nthMonday(year, 7, 3), UMI);
    if (year >= 2016) add(8, 11, YAMA);
  }

  if (year >= 1966 && year <= 2002) add(9, 15, KEIRO);
  else if (year >= 2003) add(9, nthMonday(year, 9, 3), KEIRO);
  add(9, autumnalEquinoxDay(year), SHUBUN);

  if (year >= 1966 && year <= 1999) add(10, 10, TAIIKU);
  else if (year >= 2000 && year <= 2019) add(10, nthMonday(year, 10, 2), TAIIKU);
  else if (year >= 2022) add(10, nthMonday(year, 10, 2), SPORTS);

  add(11, 3, BUNKA);
  add(11, 23, KINRO);
  if (year >= 1989 && year <= 2018) add(12, 23, TENNO_TANJOBI);
  return list;
}

function isOnOrAfter(
  year: number,
  index: number,
  start: { year: number; month: number; day: number }
): boolean {
  if (year !== start.year) return year > start.year;
  return index >= dayOfYear(start.year, start.month, start.day);
}

/**
 * year 年の休日(国民の祝日・振替休日・国民の休日・その年限りの休日)を日付順に返す
 * 対応範囲外の年はエラーにする
 */
export function listHolidays(year: number): Holiday[] {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`対応範囲外の年です: ${year}`);
  }

  const base = new Map<number, BaseHoliday>();
  const addBase = (holiday: BaseHoliday) => {
    const index = dayOfYear(year, holiday.month, holiday.day);
    if (base.has(index)) {
      throw new Error(`同じ日に休日が重なっています: ${year}/${holiday.month}/${holiday.day}`);
    }
    base.set(index, holiday);
  };
  for (const { month, day, holiday } of nationalHolidaysOf(year)) {
    addBase({ ...holiday, month, day, kind: 'national', countsAsNational: true });
  }
  for (const special of SPECIAL_HOLIDAYS.filter((s) => s.year === year)) {
    addBase({
      name: special.name,
      reading: special.reading,
      month: special.month,
      day: special.day,
      kind: 'special',
      countsAsNational: special.treatedAsNational,
    });
  }
  const isNational = (index: number) => base.get(index)?.countsAsNational === true;

  // 振替休日。年をまたぐ振替(12 月 31 日の祝日)は起こらないので、年内だけで判定する
  const substitutes = new Set<number>();
  for (const [index, holiday] of base) {
    if (!holiday.countsAsNational || weekdayOf(year, index) !== 0) continue;
    if (!isOnOrAfter(year, index, SUBSTITUTE_START)) continue;
    if (year >= SUBSTITUTE_NEAREST_START_YEAR) {
      // その日後において、その日に最も近い国民の祝日でない日
      let next = index + 1;
      while (isNational(next)) next++;
      substitutes.add(next);
    } else if (!base.has(index + 1)) {
      // 翌日(翌日が祝日なら振替休日はない)
      substitutes.add(index + 1);
    }
  }

  // 国民の休日(前日と翌日が国民の祝日である日)
  const citizens = new Set<number>();
  for (let index = 1; index < daysInYear(year) - 1; index++) {
    if (!isOnOrAfter(year, index, CITIZENS_HOLIDAY_START)) continue;
    if (base.has(index) || substitutes.has(index)) continue;
    if (!isNational(index - 1) || !isNational(index + 1)) continue;
    // 2006 年までは、日曜日を除く規定があった
    if (year < CITIZENS_HOLIDAY_REVISED_YEAR && weekdayOf(year, index) === 0) continue;
    citizens.add(index);
  }

  const result: { index: number; name: HolidayName; kind: HolidayKind }[] = [
    ...[...base].map(([index, holiday]) => ({ index, name: holiday, kind: holiday.kind })),
    ...[...substitutes].map((index) => ({
      index,
      name: SUBSTITUTE_NAME,
      kind: 'substitute' as const,
    })),
    ...[...citizens].map((index) => ({ index, name: CITIZENS_NAME, kind: 'citizens' as const })),
  ];
  return result
    .sort((a, b) => a.index - b.index)
    .map(({ index, name, kind }) => ({
      ...dateOf(year, index),
      name: name.name,
      reading: name.reading,
      kind,
    }));
}

/** 入力された年の文字列を検証し、対応範囲内の年に変換する */
export function parseYear(input: string): YearParseResult {
  const text = input.trim();
  if (text === '') return { ok: false, error: '年を入力してください' };
  if (!/^\d+$/.test(text)) return { ok: false, error: '年は半角数字で入力してください' };
  const year = Number(text);
  if (year < MIN_YEAR) {
    return {
      ok: false,
      error: `${MIN_YEAR}年より前には対応していません(祝日法の施行が1948年7月20日で、1948年は年の途中からしか祝日がないため)`,
    };
  }
  if (year > MAX_YEAR) {
    return {
      ok: false,
      error: `${MAX_YEAR}年より後には対応していません(春分の日・秋分の日を求める計算式が${MAX_YEAR}年までしか使えないため)`,
    };
  }
  return { ok: true, year };
}
