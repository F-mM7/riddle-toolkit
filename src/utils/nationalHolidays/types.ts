// 国民の休日一覧の型定義

/**
 * 休日の種別
 * - national: 国民の祝日(祝日法第2条)
 * - substitute: 振替休日(祝日法第3条第2項)
 * - citizens: 国民の休日(祝日法第3条第3項。祝日に挟まれた日)
 * - special: 皇室の行事などのため、その年限りの法律で休日とされた日
 */
export type HolidayKind = 'national' | 'substitute' | 'citizens' | 'special';

export interface Holiday {
  month: number;
  day: number;
  /** 曜日(0 が日曜日、6 が土曜日) */
  weekday: number;
  name: string;
  /** 名前の読み(ひらがな) */
  reading: string;
  kind: HolidayKind;
}

export type YearParseResult = { ok: true; year: number } | { ok: false; error: string };
