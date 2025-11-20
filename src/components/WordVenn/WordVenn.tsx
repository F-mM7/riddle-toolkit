import { useState } from 'react';
import { calculateVennRegions } from '../../utils/wordVenn/vennLogic';
import styles from './WordVenn.module.css';

export function WordVenn() {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');

  // ベン図の各領域の文字を計算
  const regions = calculateVennRegions(word1, word2, word3);

  // 円の設定（正三角形配置で2円のみの重なり領域の合計を最大化）
  // 数値最適化により、半径120、中心間距離120 (=1.0R) が最適と判明
  const circles = [
    {
      cx: 250,
      cy: 165,
      r: 120,
      fill: '#DC2626', // 赤（単語1）- 暗めの赤
    },
    {
      cx: 190,
      cy: 269,
      r: 120,
      fill: '#16A34A', // 緑（単語2）- 暗めの緑
    },
    {
      cx: 310,
      cy: 269,
      r: 120,
      fill: '#2563EB', // 青（単語3）- 暗めの青
    },
  ];

  // 各領域の文字表示位置（幾何学的に厳密計算）
  // 計算方法:
  // - only領域: 各円の中心から他の2円と反対方向に0.67R
  // - intersect領域: 2円の交点のうち重心から遠い方から、弦の長さの1/4だけ重心方向に戻った位置
  // - intersectAll: 3円の重心
  const textPositions = {
    only1: { x: 250, y: 85 },
    only2: { x: 120, y: 309 },
    only3: { x: 380, y: 309 },
    intersect12: { x: 175, y: 191 },
    intersect13: { x: 325, y: 191 },
    intersect23: { x: 250, y: 321 },
    intersectAll: { x: 250, y: 234 },
  };

  const handleClear = () => {
    setWord1('');
    setWord2('');
    setWord3('');
  };

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <h2 className={styles.label}>単語入力</h2>
        <div className={styles.inputGroup}>
          <div className={styles.inputRow}>
            <label className={`${styles.inputLabel} ${styles.label1}`}>単語1</label>
            <input
              type="text"
              className={`${styles.input} ${styles.input1}`}
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
              placeholder="例: りんご"
            />
          </div>
          <div className={styles.inputRow}>
            <label className={`${styles.inputLabel} ${styles.label2}`}>単語2</label>
            <input
              type="text"
              className={`${styles.input} ${styles.input2}`}
              value={word2}
              onChange={(e) => setWord2(e.target.value)}
              placeholder="例: ごりら"
            />
          </div>
          <div className={styles.inputRow}>
            <label className={`${styles.inputLabel} ${styles.label3}`}>単語3</label>
            <input
              type="text"
              className={`${styles.input} ${styles.input3}`}
              value={word3}
              onChange={(e) => setWord3(e.target.value)}
              placeholder="例: らくだ"
            />
          </div>
        </div>
        <button className={styles.button} onClick={handleClear}>
          クリア
        </button>
      </div>

      {/* ベン図表示エリア */}
      <div className={styles.diagramSection}>
        <h2 className={styles.label}>ベン図</h2>
        <svg
          viewBox="40 20 420 390"
          className={styles.svg}
        >
            {/* 円を描画 */}
            {circles.map((circle, index) => (
              <circle
                key={index}
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                fill={circle.fill}
                fillOpacity="0.4"
                stroke={circle.fill}
                strokeWidth="2"
                style={{ mixBlendMode: 'screen' }}
              />
            ))}

            {/* 各領域の文字を表示 */}
            <text
              x={textPositions.only1.x}
              y={textPositions.only1.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.only1}
            </text>
            <text
              x={textPositions.only2.x}
              y={textPositions.only2.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.only2}
            </text>
            <text
              x={textPositions.only3.x}
              y={textPositions.only3.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.only3}
            </text>
            <text
              x={textPositions.intersect12.x}
              y={textPositions.intersect12.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.intersect12}
            </text>
            <text
              x={textPositions.intersect13.x}
              y={textPositions.intersect13.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.intersect13}
            </text>
            <text
              x={textPositions.intersect23.x}
              y={textPositions.intersect23.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.intersect23}
            </text>
            <text
              x={textPositions.intersectAll.x}
              y={textPositions.intersectAll.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="var(--color-text-primary)"
              fontWeight="bold"
            >
              {regions.intersectAll}
            </text>
        </svg>
      </div>
    </div>
  );
}
