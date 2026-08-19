import type { ScoringMethod } from '../../types/hutRi';

interface ScoreInputProps {
  method: ScoringMethod;
  score: number | null;
  timeMs: number | null;
  rank: number | null;
  onScoreChange: (v: number | null) => void;
  onTimeMsChange: (v: number | null) => void;
  onRankChange: (v: number | null) => void;
}

function toNum(value: string): number | null {
  if (value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function ScoreInput({
  method,
  score,
  timeMs,
  rank,
  onScoreChange,
  onTimeMsChange,
  onRankChange,
}: ScoreInputProps) {
  if (method === 'TIME') {
    const seconds = timeMs != null ? timeMs / 1000 : '';
    return (
      <div>
        <label className="filter-label" htmlFor="score-time">Waktu (detik)</label>
        <input
          id="score-time"
          className="input-control"
          type="number"
          step="0.01"
          min="0"
          value={seconds}
          onChange={(e) => {
            const s = toNum(e.target.value);
            onTimeMsChange(s != null ? Math.round(s * 1000) : null);
          }}
          placeholder="Contoh: 32.45"
        />
      </div>
    );
  }

  if (method === 'RANK') {
    return (
      <div>
        <label className="filter-label" htmlFor="score-rank">Peringkat (1 = terbaik)</label>
        <input
          id="score-rank"
          className="input-control"
          type="number"
          min="1"
          step="1"
          value={rank ?? ''}
          onChange={(e) => onRankChange(toNum(e.target.value))}
          placeholder="Contoh: 1"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="filter-label" htmlFor="score-points">Skor (semakin tinggi semakin baik)</label>
      <input
        id="score-points"
        className="input-control"
        type="number"
        min="0"
        step="0.01"
        value={score ?? ''}
        onChange={(e) => onScoreChange(toNum(e.target.value))}
        placeholder="Contoh: 100"
      />
    </div>
  );
}

export default ScoreInput;
