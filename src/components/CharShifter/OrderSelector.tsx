import { OrderType } from '../../utils/charShifter/types';
import styles from './OrderSelector.module.css';

interface OrderSelectorProps {
  orderType: OrderType;
  onOrderTypeChange: (orderType: OrderType) => void;
}

export function OrderSelector({ orderType, onOrderTypeChange }: OrderSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>順序</label>
      <div className={styles.buttonGroup}>
        <button
          className={orderType === 'gojuon' ? styles.active : styles.button}
          onClick={() => onOrderTypeChange('gojuon')}
          disabled={orderType === 'gojuon'}
        >
          50音順
        </button>
        <button
          className={orderType === 'iroha47' ? styles.active : styles.button}
          onClick={() => onOrderTypeChange('iroha47')}
          disabled={orderType === 'iroha47'}
        >
          いろは順（「ん」無）
        </button>
        <button
          className={orderType === 'iroha48' ? styles.active : styles.button}
          onClick={() => onOrderTypeChange('iroha48')}
          disabled={orderType === 'iroha48'}
        >
          いろは順（「ん」有）
        </button>
        <button
          className={orderType === 'alphabet' ? styles.active : styles.button}
          onClick={() => onOrderTypeChange('alphabet')}
          disabled={orderType === 'alphabet'}
        >
          アルファベット
        </button>
      </div>
    </div>
  );
}
