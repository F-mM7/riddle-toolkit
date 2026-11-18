import type { Preset } from './types';

export const PRESETS: Preset[] = [
  {
    name: 'Sample',
    rows: 4,
    cols: 5,
    board: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 2],
      [2, 3],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
    pieces: [
      [
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 2],
      ],
    ],
    rotatable: true,
    flippable: false,
  },
  {
    name: 'Clear',
    rows: 4,
    cols: 4,
    board: [],
    pieces: [[], []],
    rotatable: false,
    flippable: false,
  },
];
