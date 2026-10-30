import { useRef, useState } from 'react';
import { checkRung } from '../../utils/amidaSolver/amidaSolver';
import type { AmidaDirection, Rung } from '../../utils/amidaSolver/types';
import { LabelRow } from './LabelRow';
import styles from './AmidaBoard.module.css';

interface AmidaBoardProps {
  lineCount: number;
  rungs: readonly Rung[];
  direction: AmidaDirection;
  inputItems: readonly string[];
  resultItems: readonly string[];
  onAddRung: (left: number, y: number) => void;
  onRemoveRung: (id: number) => void;
  /** side 側の start 番目の位置から順に chars で置き換える */
  onReplaceChars: (side: AmidaDirection, start: number, chars: string[]) => void;
}

// 盤面の描画寸法（SVG ユーザー座標）
const SPACING = 64;
const MARGIN_X = 32;
const LABEL_AREA = 48;
const BOARD_HEIGHT = 380;
const HIT_WIDTH = 16;
// 上端・下端の行の右に置くコピーボタンの領域
const COPY_AREA = 48;
// キーボード操作で追加位置の高さを動かす刻み（正規化座標）
const KEY_STEP = 0.025;
const KEY_STEP_LARGE = 0.1;
const DEFAULT_KEY_Y = 0.5;

interface Ghost {
  left: number;
  y: number;
}

export function AmidaBoard({
  lineCount,
  rungs,
  direction,
  inputItems,
  resultItems,
  onAddRung,
  onRemoveRung,
  onReplaceChars,
}: AmidaBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  // キーボード操作時の追加位置の高さ（縦線の間にフォーカスがある間に ↑↓ で動かす）
  const [keyY, setKeyY] = useState(DEFAULT_KEY_Y);

  const width = MARGIN_X * 2 + SPACING * (lineCount - 1) + COPY_AREA;
  const height = LABEL_AREA * 2 + BOARD_HEIGHT;
  const boardTop = LABEL_AREA;
  const boardBottom = LABEL_AREA + BOARD_HEIGHT;
  const lineX = (i: number) => MARGIN_X + SPACING * i;
  const rungY = (y: number) => boardTop + BOARD_HEIGHT * y;

  // ポインタ位置を盤面上の候補（どの縦線間・どの高さ）に変換する
  const toCandidate = (clientX: number, clientY: number): Ghost | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    if (pt.y < boardTop || pt.y > boardBottom) return null;
    const left = Math.floor((pt.x - MARGIN_X) / SPACING);
    if (left < 0 || left > lineCount - 2) return null;
    const y = (pt.y - boardTop) / BOARD_HEIGHT;
    return { left, y };
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const c = toCandidate(e.clientX, e.clientY);
    if (!c) return;
    onAddRung(c.left, c.y);
    setGhost(null);
  };

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    setGhost(toCandidate(e.clientX, e.clientY));
  };

  // 縦線の間（追加位置）のキーボード操作: ↑↓で高さ、Enter/Space で追加
  const handleGapKeyDown = (left: number) => (e: React.KeyboardEvent<SVGRectElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
      let y = keyY;
      if (e.key === 'ArrowUp') y = keyY - step;
      if (e.key === 'ArrowDown') y = keyY + step;
      if (e.key === 'Home') y = 0;
      if (e.key === 'End') y = 1;
      y = Math.round(Math.max(0, Math.min(1, y)) * 1000) / 1000;
      setKeyY(y);
      setGhost({ left, y });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAddRung(left, keyY);
    }
  };

  const handleRungKeyDown = (id: number) => (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemoveRung(id);
    }
  };

  const percent = (y: number) => `${Math.round(y * 100)}%`;
  // 追加可否は横線の増減に追従させるため描画時に判定する
  const ghostOk = ghost ? checkRung(lineCount, rungs, ghost.left, ghost.y).ok : false;

  const topItems = direction === 'top' ? inputItems : resultItems;
  const bottomItems = direction === 'top' ? resultItems : inputItems;
  const topClass = direction === 'top' ? styles.inputLabel : styles.resultLabel;
  const bottomClass = direction === 'top' ? styles.resultLabel : styles.inputLabel;

  // 上端・下端の文字の行（各位置の文字を HTML の input で直接編集する）
  const labelLeft = MARGIN_X - SPACING / 2;
  const labelRow = (
    side: AmidaDirection,
    items: readonly string[],
    className: string,
    y: number
  ) => (
    <foreignObject x={labelLeft} y={y} width={width - labelLeft} height={LABEL_AREA}>
      <LabelRow
        name={side === 'top' ? '上端' : '下端'}
        items={items}
        cellWidth={SPACING}
        height={LABEL_AREA}
        className={className}
        onReplace={(start, chars) => onReplaceChars(side, start, chars)}
      />
    </foreignObject>
  );

  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setGhost(null)}
        role="group"
        aria-label="あみだくじの盤面"
      >
        {labelRow('top', topItems, topClass, 0)}

        {/* 縦線 */}
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={`v${i}`}
            className={styles.vertical}
            x1={lineX(i)}
            y1={boardTop}
            x2={lineX(i)}
            y2={boardBottom}
          />
        ))}

        {/* 縦線の間（キーボードで横線を追加するためのフォーカス対象） */}
        {Array.from({ length: Math.max(0, lineCount - 1) }, (_, i) => (
          <rect
            key={`gap${i}`}
            className={styles.gap}
            x={lineX(i)}
            y={boardTop}
            width={SPACING}
            height={BOARD_HEIGHT}
            tabIndex={0}
            role="button"
            aria-label={`縦線${i + 1}と${i + 2}の間に横線を追加（高さ: 上から${percent(keyY)}、↑↓で変更、Enterで追加）`}
            onMouseDown={(e) => e.preventDefault()}
            onFocus={() => setGhost({ left: i, y: keyY })}
            onBlur={() => setGhost(null)}
            onKeyDown={handleGapKeyDown(i)}
          />
        ))}

        {/* 追加位置のプレビュー */}
        {ghost && (
          <line
            className={ghostOk ? styles.ghost : styles.ghostNg}
            x1={lineX(ghost.left)}
            y1={rungY(ghost.y)}
            x2={lineX(ghost.left + 1)}
            y2={rungY(ghost.y)}
          />
        )}

        {/* 横線（見た目の線 + クリック用の太い当たり判定） */}
        {rungs.map((r) => (
          <g
            key={r.id}
            className={styles.rungGroup}
            tabIndex={0}
            role="button"
            aria-label={`縦線${r.left + 1}と${r.left + 2}の間、上から${percent(r.y)}の横線を削除`}
            onMouseDown={(e) => e.preventDefault()}
            onKeyDown={handleRungKeyDown(r.id)}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveRung(r.id);
            }}
            onMouseMove={(e) => {
              e.stopPropagation();
              setGhost(null);
            }}
          >
            <line
              className={styles.rung}
              x1={lineX(r.left)}
              y1={rungY(r.y)}
              x2={lineX(r.left + 1)}
              y2={rungY(r.y)}
            />
            <line
              className={styles.rungHit}
              x1={lineX(r.left)}
              y1={rungY(r.y)}
              x2={lineX(r.left + 1)}
              y2={rungY(r.y)}
              strokeWidth={HIT_WIDTH}
            >
              <title>クリックで削除</title>
            </line>
          </g>
        ))}

        {labelRow('bottom', bottomItems, bottomClass, boardBottom)}
      </svg>
    </div>
  );
}
