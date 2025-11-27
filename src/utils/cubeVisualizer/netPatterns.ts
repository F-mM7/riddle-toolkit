import { NetPattern } from '../../types/cube';

/**
 * 立方体の11種類の展開図パターン（新形式）
 *
 * 各パターンはfaces配列で定義：
 * [0] right  (+X軸)
 * [1] left   (-X軸)
 * [2] top    (+Y軸)
 * [3] bottom (-Y軸)
 * [4] front  (+Z軸)
 * [5] back   (-Z軸)
 *
 * rotation値は、平面上の文字の向きと3D空間での面の向きの差分を表す
 * 最終回転角度 = ユーザー入力 + rotation
 */

export const NET_PATTERNS: NetPattern[] = [
  // パターン1: 11DMB
  // 展開図:
  // U          [0,0]
  // L F R B  → [1,0][1,1][1,2][1,3]
  // D          [2,0]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '11DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 0], rotation: 90 }, // [2] top
      { cell: [2, 0], rotation: 270 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン2: 12DMB
  // 展開図:
  // U          [0,0]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //   D             [2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '12DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 0], rotation: 90 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン3: 13DMB
  // 展開図:
  // U          [0,0]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //     D                [2,2]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '13DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 0], rotation: 90 }, // [2] top
      { cell: [2, 2], rotation: 90 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン4: 14DMB
  // 展開図:
  // U          [0,0]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //       D                   [2,3]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '14DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 0], rotation: 90 }, // [2] top
      { cell: [2, 3], rotation: 180 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン5: 21DMB
  // 展開図:
  //   U             [0,1]
  // L F R B  → [1,0][1,1][1,2][1,3]
  // D          [2,0]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '21DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 0], rotation: 270 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン6: 22DMB
  // 展開図:
  //   U             [0,1]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //   D             [2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '22DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン7: 23DMB
  // 展開図:
  //   U             [0,1]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //     D                [2,2]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '23DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 2], rotation: 90 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン8 : 31DMB
  // 展開図:
  //     U                [0,2]
  // L F R B  → [1,0][1,1][1,2][1,3]
  // D          [2,0]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '31DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 2], rotation: 270 }, // [2] top
      { cell: [2, 0], rotation: 270 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン9: 32DMB
  // 展開図:
  //     U                [0,2]
  // L F R B  → [1,0][1,1][1,2][1,3]
  //   D             [2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '32DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 2], rotation: 270 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン10: 41DMB
  // 展開図:
  //       U                   [0,3]
  // L F R B  → [1,0][1,1][1,2][1,3]
  // D          [2,0]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '41DMB',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [1, 0], rotation: 0 }, // [1] left
      { cell: [0, 3], rotation: 180 }, // [2] top
      { cell: [2, 0], rotation: 270 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン11: z
  // 展開図:
  // L F R      [0,0][0,1][0,2]
  //     D B U            [1,2][1,3][1,4]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: 'z',
    faces: [
      { cell: [0, 2], rotation: 0 }, // [0] right
      { cell: [0, 0], rotation: 0 }, // [1] left
      { cell: [1, 4], rotation: 90 }, // [2] top
      { cell: [1, 2], rotation: 90 }, // [3] bottom
      { cell: [0, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 270 }, // [5] back
    ],
  },
  // パターン12: s
  // 展開図:
  //     F R B            [0,2][0,3][0,4]
  // U L D      [1,0][1,1][1,2]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: 's',
    faces: [
      { cell: [0, 3], rotation: 0 }, // [0] right
      { cell: [1, 1], rotation: 90 }, // [1] left
      { cell: [1, 0], rotation: 180 }, // [2] top
      { cell: [1, 2], rotation: 0 }, // [3] bottom
      { cell: [0, 2], rotation: 0 }, // [4] front
      { cell: [0, 4], rotation: 0 }, // [5] back
    ],
  },
  // パターン13: 2-3-1A
  // 展開図:
  // L U        [0,0][0,1]
  //   F R B  →      [1,1][1,2][1,3]
  //   D             [2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '2-3-1A',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [0, 0], rotation: 270 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン14: 2-3-1B
  // 展開図:
  // L U        [0,0][0,1]
  //   F R B  →      [1,1][1,2][1,3]
  //     D                [2,2]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '2-3-1B',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [0, 0], rotation: 270 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 2], rotation: 90 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン15: 2-3-1C
  // 展開図:
  // L U        [0,0][0,1]
  //   F R B  →      [1,1][1,2][1,3]
  //       D                   [2,3]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '2-3-1C',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [0, 0], rotation: 270 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 3], rotation: 180 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン16: 1-3-2A
  // 展開図:
  //   U             [0,1]
  //   F R B  →      [1,1][1,2][1,3]
  // L D        [2,0][2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '2-3-1A',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [2, 0], rotation: 90 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン17: 1-3-2B
  // 展開図:
  //     U                [0,2]
  //   F R B  →      [1,1][1,2][1,3]
  // L D        [2,0][2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '1-3-2B',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [2, 0], rotation: 90 }, // [1] left
      { cell: [0, 2], rotation: 270 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン18: 1-3-2C
  // 展開図:
  //       U                   [0,3]
  //   F R B  →      [1,1][1,2][1,3]
  // L D        [2,0][2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: '1-3-2C',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [2, 0], rotation: 90 }, // [1] left
      { cell: [0, 3], rotation: 180 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [1, 3], rotation: 0 }, // [5] back
    ],
  },
  // パターン19: zz
  // 展開図:
  // L U        [0,0][0,1]
  //   F R   →       [1,1][1,2]
  //     D B              [2,2][2,3]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: 'zz',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [0, 0], rotation: 270 }, // [1] left
      { cell: [0, 1], rotation: 0 }, // [2] top
      { cell: [2, 2], rotation: 90 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [2, 3], rotation: 270 }, // [5] back
    ],
  },
  // パターン20: ss
  // 展開図:
  //     U B              [0,2][0,3]
  //   F R   →       [1,1][1,2]
  // L D        [2,0][2,1]
  //
  // U=top, L=left, F=front, R=right, B=back, D=bottom
  {
    name: 'ss',
    faces: [
      { cell: [1, 2], rotation: 0 }, // [0] right
      { cell: [2, 0], rotation: 90 }, // [1] left
      { cell: [0, 2], rotation: 270 }, // [2] top
      { cell: [2, 1], rotation: 0 }, // [3] bottom
      { cell: [1, 1], rotation: 0 }, // [4] front
      { cell: [0, 3], rotation: 90 }, // [5] back
    ],
  },
];
