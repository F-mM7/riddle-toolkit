import { useEffect, useRef, useState } from 'react';
import { colorSet } from '../../utils/tilingSolver/colorSet';
import { PRESETS } from '../../utils/tilingSolver/presets';
import { solve } from '../../utils/tilingSolver/solver';
import type { Cell, Piece, Preset, SolveResult } from '../../utils/tilingSolver/types';
import { EditableGrid } from './EditableGrid';
import { NumberStepper } from './NumberStepper';
import { SolutionList } from './SolutionView';
import styles from './TilingSolver.module.css';

/** 行数・列数・ピース数の上限 */
const MAX_SIZE = 20;
/** 解の上限件数 */
const MAX_SOLUTIONS = 100;
/** 盤面グリッドの1マスの最大の大きさ(px) */
const BOARD_CELL_SIZE = 40;
/** ピースグリッドの1マスの最大の大きさ(px) */
const PIECE_CELL_SIZE = 24;

const INITIAL_ROWS = 4;
const INITIAL_COLS = 4;
const INITIAL_PIECE_COUNT = 4;

/** Solve を押した時点の入力と、その結果 */
type SolvedState = {
  board: Cell[];
  pieces: Piece[];
  result: SolveResult;
};

const withinBounds = (cells: Cell[], rows: number, cols: number): Cell[] =>
  cells.filter(([r, c]) => r < rows && c < cols);

const copyCells = (cells: readonly Cell[]): Cell[] => cells.map(([r, c]) => [r, c]);

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/** 「なし / あり」を切り替えるボタンの組 */
function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label={label}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={styles.toggleButtons}>
        <button
          type="button"
          className={value ? styles.toggleButton : styles.toggleActive}
          aria-pressed={!value}
          onClick={() => onChange(false)}
        >
          なし
        </button>
        <button
          type="button"
          className={value ? styles.toggleActive : styles.toggleButton}
          aria-pressed={value}
          onClick={() => onChange(true)}
        >
          あり
        </button>
      </div>
    </div>
  );
}

export function TilingSolver() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [cols, setCols] = useState(INITIAL_COLS);
  const [board, setBoard] = useState<Cell[]>([]);
  const [pieces, setPieces] = useState<Piece[]>(() =>
    Array.from({ length: INITIAL_PIECE_COUNT }, () => [])
  );
  const [rotatable, setRotatable] = useState(false);
  const [flippable, setFlippable] = useState(false);
  const [solved, setSolved] = useState<SolvedState | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const solveTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (solveTimer.current !== null) window.clearTimeout(solveTimer.current);
    },
    []
  );

  const colors = colorSet(pieces.length);

  const resize = (nextRows: number, nextCols: number) => {
    setRows(nextRows);
    setCols(nextCols);
    // 縮めたときは範囲外のマスを盤面とピースの両方から除く
    setBoard((prev) => withinBounds(prev, nextRows, nextCols));
    setPieces((prev) => prev.map((piece) => withinBounds(piece, nextRows, nextCols)));
  };

  const changePieceCount = (count: number) => {
    setPieces((prev) =>
      count <= prev.length
        ? prev.slice(0, count)
        : [...prev, ...Array.from({ length: count - prev.length }, (): Piece => [])]
    );
  };

  const changePiece = (index: number, cells: Cell[]) => {
    setPieces((prev) => prev.map((piece, i) => (i === index ? cells : piece)));
  };

  const loadPreset = (preset: Preset) => {
    if (solveTimer.current !== null) {
      window.clearTimeout(solveTimer.current);
      solveTimer.current = null;
    }
    setIsSolving(false);
    setRows(preset.rows);
    setCols(preset.cols);
    setBoard(copyCells(preset.board));
    setPieces(preset.pieces.map(copyCells));
    setRotatable(preset.rotatable);
    setFlippable(preset.flippable);
    setSolved(null);
  };

  const handleSolve = () => {
    const boardSnapshot = copyCells(board);
    const piecesSnapshot = pieces.map(copyCells);
    const options = { rotatable, flippable, maxSolutions: MAX_SOLUTIONS };
    setIsSolving(true);
    // 「計算中...」を描画してから同期計算を始める
    solveTimer.current = window.setTimeout(() => {
      solveTimer.current = null;
      const result = solve(boardSnapshot, piecesSnapshot, options);
      setSolved({ board: boardSnapshot, pieces: piecesSnapshot, result });
      setIsSolving(false);
    }, 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.presets}>
        <span className={styles.presetsLabel}>プリセット</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className={styles.button}
            onClick={() => loadPreset(preset)}
            disabled={isSolving}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>盤面</h2>
        <div className={styles.controls}>
          <NumberStepper
            label="行数"
            value={rows}
            min={1}
            max={MAX_SIZE}
            onChange={(value) => resize(value, cols)}
            decrementLabel="行を減らす"
            incrementLabel="行を増やす"
            valueLabel={`${rows}行`}
          />
          <NumberStepper
            label="列数"
            value={cols}
            min={1}
            max={MAX_SIZE}
            onChange={(value) => resize(rows, value)}
            decrementLabel="列を減らす"
            incrementLabel="列を増やす"
            valueLabel={`${cols}列`}
          />
        </div>
        <p className={styles.hint}>
          ドラッグで敷き詰めるマスを選びます(選択済みのマスから始めると消去)
        </p>
        <EditableGrid
          cellSize={BOARD_CELL_SIZE}
          rows={rows}
          cols={cols}
          color="var(--color-text-secondary)"
          selectedCells={board}
          onChange={setBoard}
          aria-label="盤面"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ピース</h2>
        <div className={styles.controls}>
          <NumberStepper
            label="ピース数"
            value={pieces.length}
            min={1}
            max={MAX_SIZE}
            onChange={changePieceCount}
            decrementLabel="ピースを減らす"
            incrementLabel="ピースを増やす"
            valueLabel={`${pieces.length}個`}
          />
        </div>
        <ul className={styles.pieceList}>
          {pieces.map((piece, index) => (
            <li key={index} className={styles.pieceItem}>
              <span className={styles.pieceLabel}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: colors[index] }}
                  aria-hidden="true"
                />
                ピース{index + 1}
              </span>
              <EditableGrid
                cellSize={PIECE_CELL_SIZE}
                rows={rows}
                cols={cols}
                color={colors[index]}
                selectedCells={piece}
                onChange={(cells) => changePiece(index, cells)}
                aria-label={`ピース${index + 1}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <div className={styles.controls}>
          <Toggle label="回転" value={rotatable} onChange={setRotatable} />
          <Toggle label="裏返し" value={flippable} onChange={setFlippable} />
        </div>
        <button
          type="button"
          className={styles.solveButton}
          onClick={handleSolve}
          disabled={isSolving}
        >
          {isSolving ? '計算中...' : '解く'}
        </button>
      </section>

      <SolutionList
        board={solved?.board ?? []}
        pieces={solved?.pieces ?? []}
        result={solved?.result ?? null}
        isSolving={isSolving}
        maxSolutions={MAX_SOLUTIONS}
      />
    </div>
  );
}
