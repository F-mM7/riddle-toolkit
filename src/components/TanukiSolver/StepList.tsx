import type { TanukiResult, TanukiStep } from '../../utils/tanukiSolver/tanukiSolver';
import styles from './StepList.module.css';

interface StepListProps {
  result: TanukiResult;
  hasTarget: boolean;
}

/** 空文字列を「（空）」として表示する */
function display(text: string) {
  return text === '' ? <span className={styles.emptyText}>（空）</span> : text;
}

/** 過程1行のうち、規則と結果の表示部分 */
function StepContent({ step }: { step: TanukiStep }) {
  if (step.kind === 'delete') {
    return (
      <>
        <span className={styles.pattern}>−「{step.pattern}」</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.text}>{display(step.after)}</span>
        {step.removedCount === 0 ? (
          <span className={styles.unchanged}>変更なし</span>
        ) : (
          <span className={styles.removed}>{step.removedCount}文字削除</span>
        )}
      </>
    );
  }

  return (
    <>
      <span className={styles.pattern}>
        「{step.from}」→「{step.to}」に置換
      </span>
      <span className={styles.arrow}>→</span>
      <span className={styles.text}>{display(step.after)}</span>
      {step.error !== null ? (
        <span className={styles.error}>エラー: {step.error}（この行は適用していません）</span>
      ) : step.replacedCount === 0 ? (
        <span className={styles.unchanged}>変更なし</span>
      ) : (
        <span className={styles.removed}>{step.replacedCount}箇所置換</span>
      )}
      {step.ignored.length > 0 && (
        <span className={styles.unchanged}>
          {step.ignored.map((word) => `「${word}」`).join('')}は無視
        </span>
      )}
    </>
  );
}

export function StepList({ result, hasTarget }: StepListProps) {
  if (!hasTarget) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>対象文字列を入力してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.final}>{display(result.final)}</div>
      {result.steps.length === 0 ? (
        <p className={styles.emptyMessage}>削除文字列を入力してください</p>
      ) : (
        <>
          <h4 className={styles.subtitle}>過程</h4>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepLabel}>元</span>
              <span className={styles.text}>{display(result.initial)}</span>
            </li>
            {result.steps.map((step, i) => (
              <li key={i} className={styles.step}>
                <span className={styles.stepLabel}>{i + 1}</span>
                <StepContent step={step} />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
