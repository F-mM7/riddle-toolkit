import { GridData } from "../../types/cube";
import GridCell from "./GridCell";
import styles from "./InputGrid.module.css";

interface InputGridProps {
  gridData: GridData;
  onGridChange: (gridData: GridData) => void;
}

export default function InputGrid({ gridData, onGridChange }: InputGridProps) {
  const handleCellChange = (row: number, col: number, char: string) => {
    const newGridData = gridData.map((rowData, r) =>
      rowData.map((cell, c) => {
        if (r === row && c === col) {
          return { ...cell, char };
        }
        return cell;
      })
    );
    onGridChange(newGridData);
  };

  const handleCellRotate = (row: number, col: number, direction: "left" | "right") => {
    const newGridData = gridData.map((rowData, r) =>
      rowData.map((cell, c) => {
        if (r === row && c === col) {
          const rotationDelta = direction === "left" ? -90 : 90;
          const newRotation = (cell.rotation + rotationDelta + 360) % 360;
          return { ...cell, rotation: newRotation };
        }
        return cell;
      })
    );
    onGridChange(newGridData);
  };

  return (
    <div className={styles.inputGrid}>
      {gridData.map((rowData, rowIndex) => (
        <div key={rowIndex} className={styles.gridRow}>
          {rowData.map((cellData, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              cellData={cellData}
              onChange={handleCellChange}
              onRotate={handleCellRotate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
