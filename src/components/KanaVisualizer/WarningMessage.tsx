import React from 'react';
import styles from './WarningMessage.module.css';

interface WarningMessageProps {
  invalidChars: string[];
}

const WarningMessage: React.FC<WarningMessageProps> = ({ invalidChars }) => {
  if (invalidChars.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.icon}>⚠️</div>
      <div className={styles.content}>
        <p className={styles.text}>
          以下の文字は対応していないため無視されます: {invalidChars.join('、')}
        </p>
      </div>
    </div>
  );
};

export default WarningMessage;
