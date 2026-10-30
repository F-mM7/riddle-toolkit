import { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  /** 操作の説明（例: 「上端の文字をコピー」） */
  label: string;
}

type CopyStatus = 'copied' | 'failed';

/** コピー結果の表示を保つ時間（ミリ秒） */
const FEEDBACK_MS = 1500;

/** text をクリップボードにコピーするボタン。結果は一定時間、またはコピーした内容が変わるまで表示する */
export function CopyButton({ text, label }: CopyButtonProps) {
  // どの内容に対する結果かを持ち、内容が変わったら表示を戻す
  const [result, setResult] = useState<{ status: CopyStatus; text: string } | null>(null);
  const status = result?.text === text ? result.status : null;

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(null), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [result]);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setResult({ status: 'copied', text });
    } catch {
      setResult({ status: 'failed', text });
    }
  };

  const message =
    status === 'copied' ? 'コピーしました' : status === 'failed' ? 'コピーできませんでした' : label;
  const Icon = status === 'copied' ? Check : status === 'failed' ? X : Copy;

  return (
    <button
      type="button"
      className={`${styles.button} ${status ? styles[status] : ''}`}
      onClick={handleClick}
      aria-label={label}
      title={message}
    >
      <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
      <span className={styles.status} role="status">
        {status ? message : ''}
      </span>
    </button>
  );
}
