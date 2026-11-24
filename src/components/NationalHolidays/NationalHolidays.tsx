import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAY } from '../../data/sequences';
import {
  LAST_ANNOUNCED_YEAR,
  MAX_YEAR,
  MIN_YEAR,
  listHolidays,
  parseYear,
} from '../../utils/nationalHolidays/nationalHolidays';
import type { HolidayKind } from '../../utils/nationalHolidays/types';
import { CopyButton } from '../AmidaSolver/CopyButton';
import styles from './NationalHolidays.module.css';

const KIND_LABELS: Record<HolidayKind, string> = {
  national: '国民の祝日',
  substitute: '振替休日',
  citizens: '国民の休日',
  special: 'その年限りの休日',
};

/** 曜日の表記(0 が日曜日)。シーケンスの曜日(月曜始まり)から引く */
function weekdayLabel(weekday: number): string {
  return WEEKDAY.items[(weekday + 6) % 7].display;
}

export function NationalHolidays() {
  const [input, setInput] = useState(() => String(new Date().getFullYear()));
  const parsed = parseYear(input);
  const year = parsed.ok ? parsed.year : null;
  const holidays = useMemo(() => (year === null ? [] : listHolidays(year)), [year]);

  const shiftYear = (delta: number) => {
    if (year !== null) setInput(String(year + delta));
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputCard}>
        <label htmlFor="national-holidays-year" className={styles.label}>
          年(西暦。{MIN_YEAR}〜{MAX_YEAR}年)
        </label>
        <div className={styles.yearRow}>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => shiftYear(-1)}
            disabled={year === null || year <= MIN_YEAR}
            aria-label="前の年"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <input
            id="national-holidays-year"
            type="text"
            inputMode="numeric"
            className={`${styles.input} ${parsed.ok ? '' : styles.inputError}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={!parsed.ok}
            aria-describedby={parsed.ok ? undefined : 'national-holidays-year-error'}
          />
          <span className={styles.unit}>年</span>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => shiftYear(1)}
            disabled={year === null || year >= MAX_YEAR}
            aria-label="次の年"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        {!parsed.ok && (
          <p id="national-holidays-year-error" className={styles.error}>
            {parsed.error}
          </p>
        )}
      </div>

      {year !== null && (
        <section className={styles.resultCard} aria-labelledby="national-holidays-heading">
          <div className={styles.resultHeader}>
            <h2 id="national-holidays-heading" className={styles.heading}>
              {year}年の休日({holidays.length}日)
            </h2>
            <div className={styles.copyActions}>
              <span className={styles.copyAction}>
                <span aria-hidden="true">名前</span>
                <CopyButton
                  text={holidays.map((h) => h.name).join('\n')}
                  label={`${year}年の休日の名前をコピー`}
                />
              </span>
              <span className={styles.copyAction}>
                <span aria-hidden="true">かな</span>
                <CopyButton
                  text={holidays.map((h) => h.reading).join('\n')}
                  label={`${year}年の休日の読みをコピー`}
                />
              </span>
            </div>
          </div>
          {year > LAST_ANNOUNCED_YEAR && (
            <p className={styles.notice}>
              {LAST_ANNOUNCED_YEAR + 1}
              年以降は、現在の祝日法に基づく計算結果です。春分の日・秋分の日は前年の2月に官報で公表されて決まるため、計算による推定です。法改正があれば変わります。
            </p>
          )}
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.num}>
                    月
                  </th>
                  <th scope="col" className={styles.num}>
                    日
                  </th>
                  <th scope="col">曜日</th>
                  <th scope="col">名前</th>
                  <th scope="col">読み</th>
                  <th scope="col">種別</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={`${h.month}-${h.day}`}>
                    <td className={styles.num}>{h.month}</td>
                    <td className={styles.num}>{h.day}</td>
                    <td className={h.weekday === 0 ? styles.sunday : undefined}>
                      {weekdayLabel(h.weekday)}
                    </td>
                    <td>{h.name}</td>
                    <td>{h.reading}</td>
                    <td className={styles.kind}>{KIND_LABELS[h.kind]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
