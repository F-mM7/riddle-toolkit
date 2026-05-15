import { useEffect, useMemo, useState } from 'react';
import { SEQUENCES } from '../../data/sequences';
import { generateSkipSequence } from '../../utils/sequenceSkipper/sequenceSkipper';
import { SequenceSelector } from './SequenceSelector';
import { SkipInput } from './SkipInput';
import { ResultDisplay } from './ResultDisplay';
import styles from './SequenceSkipper.module.css';

export function SequenceSkipper() {
  const [sequenceId, setSequenceId] = useState<string>(SEQUENCES[0].id);
  const [stepCount, setStepCount] = useState<number>(2);

  const currentSequence = useMemo(
    () => SEQUENCES.find((s) => s.id === sequenceId) ?? SEQUENCES[0],
    [sequenceId]
  );

  const maxStep = Math.max(1, currentSequence.items.length - 1);

  // シーケンス切替で送る数が新しい上限を超えたら上限に丸める
  useEffect(() => {
    setStepCount((prev) => Math.min(prev, maxStep));
  }, [maxStep]);

  // このページ表示中は外側の縦スクロールを抑制し、結果領域内のみでスクロールさせる
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const results = useMemo(
    () => generateSkipSequence(currentSequence.items, stepCount),
    [currentSequence, stepCount]
  );

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <SequenceSelector
          sequences={SEQUENCES}
          selectedId={sequenceId}
          onSelect={setSequenceId}
        />
        <SkipInput
          stepCount={stepCount}
          maxStep={maxStep}
          onChange={setStepCount}
        />
      </div>

      <ResultDisplay results={results} />
    </div>
  );
}
