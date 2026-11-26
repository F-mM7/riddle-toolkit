import { useId } from 'react';
import type { ReactNode } from 'react';
import { regionColor } from '../../utils/wordVenn/colors';
import type { SetColor } from '../../utils/wordVenn/colors';
import type { Circle, LabelPos, RegionTexts, VennLayout } from '../../utils/wordVenn/types';
import styles from './VennDiagram.module.css';

export interface VennDiagramProps {
  layout: VennLayout;
  regions: RegionTexts;
  colors: readonly SetColor[];
}

/** 平面図の文字サイズ(既存の単語ベン図と同じ) */
const PLANE_FONT_SIZE = 24;
/** コピーで補う図の文字サイズの上限・下限。上限は配置データの labels の width を測った長方形の高さと同じ */
const FIT_FONT_MAX = 20;
const FIT_FONT_MIN = 9;
/** 領域どうしの境目に引く線の太さ(viewBox の長辺に対する比) */
const SEPARATOR_RATIO = 0.009;
/** ラベルの縁取りの太さ(文字サイズに対する比) */
const LABEL_OUTLINE_RATIO = 0.22;

type Vec = [number, number];

interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

function parseViewBox(viewBox: string): ViewBox {
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (values.length !== 4 || values.some((v) => !Number.isFinite(v))) {
    throw new Error(`viewBox の形式が不正です: "${viewBox}"`);
  }
  const [minX, minY, width, height] = values;
  return { minX, minY, width, height };
}

/**
 * 文字列の横幅が width に収まる文字サイズを返す。
 * 全角1文字の幅をフォントサイズと同じとみなし、幅 len*fs が width 以下になる最大の fs を、上限・下限の間に収める。
 * 文字の高さ fs は上限以下なので、配置データの長方形(高さ=上限)に収まる。
 * 下限で収まらない場合も下限のまま表示する(省略しない)。
 */
function fitFontSize(text: string, width: number): number {
  const len = Array.from(text).length;
  return Math.min(FIT_FONT_MAX, Math.max(FIT_FONT_MIN, width / len));
}

/**
 * 集合ごとの形(円の集まり)。平面は円1つ、replica は中央の円と、その集合のコピーすべて。
 */
function setShapes(layout: VennLayout): Circle[][] {
  switch (layout.kind) {
    case 'plane':
      return layout.circles.map((circle) => [circle]);
    case 'replica':
      return layout.circles.map((circle, set) => [
        circle,
        ...layout.copies.filter((copy) => copy.set === set).map(({ cx, cy, r }) => ({ cx, cy, r })),
      ]);
  }
}

function polygonPath(points: Vec[]): string {
  return `M${points.map((p) => p.join(',')).join('L')}Z`;
}

/** 円を2つの半円の弧で描く閉じた path */
function circlePath({ cx, cy, r }: Circle): string {
  return `M${cx - r},${cy}A${r},${r} 0 1 0 ${cx + r},${cy}A${r},${r} 0 1 0 ${cx - r},${cy}Z`;
}

/** 穴(holePath)の外側を覆う半透明の幕(viewBox 全体から穴をくり抜いた形) */
function OutsideVeil({ holePath, vb }: { holePath: string; vb: ViewBox }) {
  const outer: Vec[] = [
    [vb.minX, vb.minY],
    [vb.minX + vb.width, vb.minY],
    [vb.minX + vb.width, vb.minY + vb.height],
    [vb.minX, vb.minY + vb.height],
  ];
  return (
    <path d={polygonPath(outer) + holePath} fillRule="evenodd" className={styles.outsideVeil} />
  );
}

function RegionLabels<Label extends LabelPos>({
  labels,
  regions,
  fontSizeOf,
}: {
  labels: Record<number, Label>;
  regions: RegionTexts;
  fontSizeOf: (text: string, pos: Label) => number;
}) {
  return (
    <g>
      {Object.entries(labels).map(([maskKey, pos]) => {
        const text = regions[Number(maskKey)] ?? '';
        if (text === '') return null;
        const fontSize = fontSizeOf(text, pos);
        return (
          <text
            key={maskKey}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            strokeWidth={fontSize * LABEL_OUTLINE_RATIO}
            className={styles.label}
          >
            {text}
          </text>
        );
      })}
    </g>
  );
}

/**
 * 所属パターン mask の領域を塗る。
 * 所属する集合の clipPath を入れ子にして共通部分を取り、所属しない集合を mask で抜く。
 */
function RegionFill({
  mask,
  setCount,
  idOf,
  vb,
  fill,
}: {
  mask: number;
  setCount: number;
  idOf: (kind: 'in' | 'out', setIndex: number) => string;
  vb: ViewBox;
  fill: string;
}) {
  let node: ReactNode = (
    <rect x={vb.minX} y={vb.minY} width={vb.width} height={vb.height} fill={fill} />
  );
  for (let k = 0; k < setCount; k++) {
    node =
      (mask & (1 << k)) !== 0 ? (
        <g clipPath={`url(#${idOf('in', k)})`}>{node}</g>
      ) : (
        <g mask={`url(#${idOf('out', k)})`}>{node}</g>
      );
  }
  return <>{node}</>;
}

export default function VennDiagram({ layout, regions, colors }: VennDiagramProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const idOf = (kind: 'in' | 'out', setIndex: number) => `venn-${uid}-${kind}-${setIndex}`;

  const vb = parseViewBox(layout.viewBox);
  const shapes = setShapes(layout);
  const setCount = layout.circles.length;
  const separatorWidth = Math.max(vb.width, vb.height) * SEPARATOR_RATIO;
  const masks = Array.from({ length: (1 << setCount) - 1 }, (_, i) => i + 1);

  return (
    <div className={styles.wrapper}>
      <svg viewBox={layout.viewBox} className={styles.svg}>
        <defs>
          {shapes.map((circles, k) => (
            <clipPath key={`in${k}`} id={idOf('in', k)}>
              {circles.map((c, m) => (
                <circle key={m} cx={c.cx} cy={c.cy} r={c.r} />
              ))}
            </clipPath>
          ))}
          {shapes.map((circles, k) => (
            <mask
              key={`out${k}`}
              id={idOf('out', k)}
              maskUnits="userSpaceOnUse"
              x={vb.minX}
              y={vb.minY}
              width={vb.width}
              height={vb.height}
            >
              <rect x={vb.minX} y={vb.minY} width={vb.width} height={vb.height} fill="white" />
              {circles.map((c, m) => (
                <circle key={m} cx={c.cx} cy={c.cy} r={c.r} fill="black" />
              ))}
            </mask>
          ))}
        </defs>
        {/* 領域(所属パターン)ごとに、所属する集合の色を混ぜた不透明な色で塗る */}
        {masks.map((mask) => (
          <RegionFill
            key={mask}
            mask={mask}
            setCount={setCount}
            idOf={idOf}
            vb={vb}
            fill={regionColor(colors, mask)}
          />
        ))}
        {/* 領域どうしの境目: すべての円の輪郭を地と同じ色の太線で引く */}
        <g className={styles.separator} strokeWidth={separatorWidth}>
          {shapes.flat().map((c, m) => (
            <circle key={m} cx={c.cx} cy={c.cy} r={c.r} />
          ))}
        </g>
        {/* replica の円形の外枠(frameCircle): 枠の外にはみ出したコピーを幕で薄め、枠を実線で引く */}
        {layout.kind === 'replica' && layout.frameCircle && (
          <>
            <OutsideVeil holePath={circlePath(layout.frameCircle)} vb={vb} />
            <circle
              cx={layout.frameCircle.cx}
              cy={layout.frameCircle.cy}
              r={layout.frameCircle.r}
              className={styles.replicaFrame}
            />
          </>
        )}
        {layout.kind === 'plane' ? (
          <RegionLabels
            labels={layout.labels}
            regions={regions}
            fontSizeOf={() => PLANE_FONT_SIZE}
          />
        ) : (
          <RegionLabels
            labels={layout.labels}
            regions={regions}
            fontSizeOf={(text, pos) => fitFontSize(text, pos.width)}
          />
        )}
      </svg>
    </div>
  );
}
