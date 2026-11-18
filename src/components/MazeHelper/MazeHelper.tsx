import { useMemo, useState } from 'react';
import {
  extendPath,
  getConnections,
  getHighlightOrder,
  getPositionNumber,
  matchConditions,
} from '../../utils/mazeHelper/mazeHelper';
import type {
  ActiveConditions,
  Cell,
  ConditionId,
  FirstNumber,
} from '../../utils/mazeHelper/types';
import { BoardSizeControl } from './BoardSizeControl';
import { ConditionToggles } from './ConditionToggles';
import { fillConditions } from './conditions';
import { MazeBoard, type PathCellInfo } from './MazeBoard';
import styles from './MazeHelper.module.css';

/** 盤面サイズの初期値と範囲 */
const DEFAULT_SIZE = 5;
const MIN_SIZE = 2;
const MAX_SIZE = 20;

const INITIAL_ENABLED: Record<ConditionId, boolean> = fillConditions(false);

/** n の入力値を解釈する。1以上の整数でなければ null */
function parseMultiple(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n >= 1 ? n : null;
}

export function MazeHelper() {
  const [rows, setRows] = useState(DEFAULT_SIZE);
  const [cols, setCols] = useState(DEFAULT_SIZE);
  const [path, setPath] = useState<Cell[]>([]);
  const [enabled, setEnabled] = useState(INITIAL_ENABLED);
  const [multipleInput, setMultipleInput] = useState('3');
  const [firstNumber, setFirstNumber] = useState<FirstNumber>(1);

  const multipleN = parseMultiple(multipleInput);

  const conditions: ActiveConditions = useMemo(() => {
    const { multiple, ...flags } = enabled;
    return { ...flags, multipleOf: multiple ? multipleN : null, firstNumber };
  }, [enabled, multipleN, firstNumber]);

  const pathMatches = useMemo(() => matchConditions(path, conditions), [path, conditions]);

  // 盤面の各マスへの経路情報(番号・線の向き・始点終点)と該当条件の割り当て
  const { pathCells, matches, counts } = useMemo(() => {
    const pathCells = Array.from({ length: rows }, () =>
      Array<PathCellInfo | null>(cols).fill(null)
    );
    const matches = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, (): ConditionId[] => [])
    );
    const counts = fillConditions(0);
    const connections = getConnections(path);
    const highlightOrder = getHighlightOrder(pathMatches);
    path.forEach((cell, i) => {
      pathCells[cell.row][cell.col] = {
        number: getPositionNumber(i, firstNumber),
        directions: connections[i],
        endpoint: i === 0 ? 'start' : i === path.length - 1 ? 'end' : null,
        highlightOrder: highlightOrder[i],
      };
      matches[cell.row][cell.col] = pathMatches[i];
      pathMatches[i].forEach((id) => {
        counts[id] += 1;
      });
    });
    return { pathCells, matches, counts };
  }, [rows, cols, path, pathMatches, firstNumber]);

  const handleTrace = (cell: Cell) => {
    setPath((prev) => extendPath(prev, cell));
  };

  // 盤面サイズを変えたら経路をクリアする
  const handleRowsChange = (value: number) => {
    setRows(value);
    setPath([]);
  };

  const handleColsChange = (value: number) => {
    setCols(value);
    setPath([]);
  };

  const handleToggle = (id: ConditionId) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <BoardSizeControl
          rows={rows}
          cols={cols}
          min={MIN_SIZE}
          max={MAX_SIZE}
          onRowsChange={handleRowsChange}
          onColsChange={handleColsChange}
        />
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => setPath([])}
          disabled={path.length === 0}
        >
          クリア
        </button>
      </div>

      <ConditionToggles
        enabled={enabled}
        counts={counts}
        multipleInput={multipleInput}
        isMultipleValid={multipleN !== null}
        firstNumber={firstNumber}
        onToggle={handleToggle}
        onMultipleInputChange={setMultipleInput}
        onFirstNumberChange={setFirstNumber}
      />

      <p className={styles.hint}>
        マスを上下左右になぞって経路を描きます。1つ前のマスへ戻ると1マス取り消し、末尾のマスからなぞると続きを描けます。
        <span className={styles.length}>経路: {path.length}マス</span>
      </p>

      <MazeBoard
        rows={rows}
        cols={cols}
        pathCells={pathCells}
        matches={matches}
        onTrace={handleTrace}
      />
    </div>
  );
}
