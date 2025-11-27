import { useRef, useState, useEffect } from "react";
import { CellData } from "../../types/cube";
import styles from "./GridCell.module.css";

interface GridCellProps {
  cellData: CellData;
  onChange: (row: number, col: number, char: string) => void;
  onRotate: (row: number, col: number, direction: "left" | "right") => void;
}

export default function GridCell({ cellData, onChange, onRotate }: GridCellProps) {
  const { row, col, char, rotation } = cellData;
  const isEmpty = char === "";
  const isComposing = useRef(false);
  const [displayValue, setDisplayValue] = useState(char);

  useEffect(() => {
    setDisplayValue(char);
  }, [char]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    // 変換確定時に1文字のみ取得（最初の1文字）
    const value = e.currentTarget.value;
    const newChar = value.slice(0, 1);
    setDisplayValue(newChar);
    onChange(row, col, newChar);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // IME変換中は表示のみ更新
    if (isComposing.current) {
      setDisplayValue(value);
      return;
    }

    // 1文字のみ許可（最初の1文字）
    const newChar = value.slice(0, 1);
    setDisplayValue(newChar);
    onChange(row, col, newChar);
  };

  const handleRotateLeft = () => {
    onRotate(row, col, "left");
  };

  const handleRotateRight = () => {
    onRotate(row, col, "right");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEmpty) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleRotateLeft();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleRotateRight();
    }
  };

  return (
    <div className={`${styles.gridCell} ${isEmpty ? "" : styles.filled}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        className={styles.cellInput}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      />
      <div className={styles.rotationControls}>
        <button
          onClick={handleRotateLeft}
          className={styles.rotateBtn}
          title="左に90度回転"
          disabled={isEmpty}
          tabIndex={-1}
        >
          ↶
        </button>
        <button
          onClick={handleRotateRight}
          className={styles.rotateBtn}
          title="右に90度回転"
          disabled={isEmpty}
          tabIndex={-1}
        >
          ↷
        </button>
      </div>
    </div>
  );
}
