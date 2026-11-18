import { useMemo, useState } from 'react';
import {
  parsePatterns,
  solveTanuki,
  type DeleteMode,
  type ScatterReplaceMode,
} from '../../utils/tanukiSolver/tanukiSolver';
import { ModeSelector } from './ModeSelector';
import { ScatterReplaceSelector } from './ScatterReplaceSelector';
import { StepList } from './StepList';
import styles from './TanukiSolver.module.css';

export function TanukiSolver() {
  const [target, setTarget] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [mode, setMode] = useState<DeleteMode>('chunk');
  const [scatterReplaceMode, setScatterReplaceMode] = useState<ScatterReplaceMode>('perChar');

  const rules = useMemo(() => parsePatterns(patternInput), [patternInput]);
  const result = useMemo(
    () => solveTanuki(target, rules, mode, scatterReplaceMode),
    [target, rules, mode, scatterReplaceMode]
  );

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="tanuki-solver-target" className={styles.label}>
          対象文字列
        </label>
        <textarea
          id="tanuki-solver-target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="例: たぬたきたつね"
          className={styles.textarea}
          rows={2}
          autoFocus
        />
        <p className={styles.hint}>改行は無視し、1続きの文字列として扱います</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="tanuki-solver-patterns" className={styles.label}>
          削除文字列
        </label>
        <textarea
          id="tanuki-solver-patterns"
          value={patternInput}
          onChange={(e) => setPatternInput(e.target.value)}
          placeholder={'例:\nた\nきつ,たぬ'}
          className={styles.textarea}
          rows={4}
        />
        <p className={styles.hint}>
          1行に1つ。上の行から順に適用します（行の前後の空白と空行は無視します）
          <br />
          1行にカンマかスペースで区切って2つ書くと、削除ではなく置換します（例: 「きつ,たぬ」で
          きつ→たぬ。3つ目以降は無視します）
        </p>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>削除方法</span>
        <ModeSelector mode={mode} onModeChange={setMode} />
        <p className={styles.hint}>
          {mode === 'chunk'
            ? 'かたまり: 削除文字列がそのまま連続して現れる箇所を削除します'
            : 'バラバラ: 削除文字列に含まれる文字を1文字ずつ、すべて削除します'}
        </p>
      </div>
      {mode === 'scatter' && (
        <div className={styles.field}>
          <span className={styles.label}>バラバラでの置換方法</span>
          <ScatterReplaceSelector mode={scatterReplaceMode} onModeChange={setScatterReplaceMode} />
          <p className={styles.hint}>
            {scatterReplaceMode === 'perChar'
              ? '1文字ずつ対応: 置換元のn文字目を置換先のn文字目に置換します（例: 「たぬ,ぽん」で た→ぽ、ぬ→ん）'
              : '各文字をまるごと置換: 置換元に含まれる各文字を置換先全体に置換します（例: 「たぬ,ぽん」で た→ぽん、ぬ→ぽん）'}
          </p>
        </div>
      )}
      <StepList result={result} hasTarget={result.initial !== ''} />
    </div>
  );
}
