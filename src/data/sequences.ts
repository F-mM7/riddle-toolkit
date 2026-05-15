// 「シーケンスとばし」用のシーケンス定義

export interface SequenceItem {
  display: string;
  reading?: string;
}

export interface Sequence {
  id: string;
  name: string;
  items: readonly SequenceItem[];
}

// 曜日（月始まり）
export const WEEKDAY: Sequence = {
  id: 'weekday',
  name: '曜日',
  items: [
    { display: '月' },
    { display: '火' },
    { display: '水' },
    { display: '木' },
    { display: '金' },
    { display: '土' },
    { display: '日' },
  ],
};

// 干支
export const ETO: Sequence = {
  id: 'eto',
  name: '干支',
  items: [
    { display: '子', reading: 'ね' },
    { display: '丑', reading: 'うし' },
    { display: '寅', reading: 'とら' },
    { display: '卯', reading: 'う' },
    { display: '辰', reading: 'たつ' },
    { display: '巳', reading: 'み' },
    { display: '午', reading: 'うま' },
    { display: '未', reading: 'ひつじ' },
    { display: '申', reading: 'さる' },
    { display: '酉', reading: 'とり' },
    { display: '戌', reading: 'いぬ' },
    { display: '亥', reading: 'い' },
  ],
};

export const SEQUENCES: readonly Sequence[] = [ETO, WEEKDAY];
