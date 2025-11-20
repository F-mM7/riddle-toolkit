import React from 'react';
import { RowColor } from '../../types/kanaVisualizer/kana';
import { colorToRgb } from '../../utils/kanaVisualizer/colorUtils';
import styles from './KanaCell.module.css';

interface KanaCellProps {
  character: string | null; // null = 空のマス
  color: RowColor | null; // null = 未塗り
}

const KanaCell: React.FC<KanaCellProps> = ({ character, color }) => {
  const backgroundColor = color ? colorToRgb(color) : undefined;

  return (
    <div
      className={styles.cell}
      style={{ backgroundColor }}
      data-filled={color !== null}
    >
      {character && <span className={styles.character}>{character}</span>}
    </div>
  );
};

export default KanaCell;
