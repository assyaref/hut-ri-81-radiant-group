import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ScoreInput from './ScoreInput';
import type {
  Competition,
  CompetitionParticipant,
  Score,
  ScoringMethod,
  Team,
} from '../../types/hutRi';

export interface ScorePayload {
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  method: ScoringMethod;
  score: number | null;
  timeMs: number | null;
  rank: number | null;
  status: string;
}

interface ScoreFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ScorePayload, reason: string) => Promise<void>;
  competition: Competition | null;
  participants: CompetitionParticipant[];
  teams: Team[];
  editingScore?: Score | null;
}

function ScoreForm({
  open,
  onClose,
  onSubmit,
  competition,
  participants,
  teams,
  editingScore,
}: ScoreFormProps) {
  const [entityKey, setEntityKey] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const method: ScoringMethod = competition?.scoringMethod || 'SCORE';
  const supportsIndividual = competition ? competition.type !== 'GROUP' : true;
  const supportsTeam = competition ? competition.type !== 'INDIVIDUAL' : true;

  useEffect(() => {
    if (!open) return;
    if (editingScore) {
      setEntityKey(
        editingScore.participantId ? `participant:${editingScore.participantId}` : editingScore.teamId ? `team:${editingScore.teamId}` : '',
      );
      setScore(editingScore.score);
      setTimeMs(editingScore.timeMs);
      setRank(editingScore.rank);
      setReason('');
    } else {
      setEntityKey('');
      setScore(null);
      setTimeMs(null);
      setRank(null);
      setReason('');
    }
  }, [open, editingScore]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!competition || !entityKey) return;
    const [kind, id] = entityKey.split(':');
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          competitionId: competition.id,
          participantId: kind === 'participant' ? id : null,
          teamId: kind === 'team' ? id : null,
          method,
          score,
          timeMs,
          rank,
          status: 'ACTIVE',
        },
        reason,
      );
      onClose();
    } catch {
      /* handled by caller */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={editingScore ? 'Edit Skor' : 'Tambah Skor'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="filter-label" htmlFor="sf-entity">Peserta / Tim</label>
          <select
            id="sf-entity"
            className="input-control"
            required
            value={entityKey}
            onChange={(e) => setEntityKey(e.target.value)}
          >
            <option value="">Pilih peserta / tim…</option>
            {supportsIndividual &&
              participants.map((cp) => (
                <option key={cp.participantId} value={`participant:${cp.participantId}`}>
                  👤 {cp.participant?.name || cp.participantId}
                </option>
              ))}
            {supportsTeam &&
              teams.map((t) => (
                <option key={t.id} value={`team:${t.id}`}>
                  👥 {t.name}
                </option>
              ))}
          </select>
        </div>

        <ScoreInput
          method={method}
          score={score}
          timeMs={timeMs}
          rank={rank}
          onScoreChange={setScore}
          onTimeMsChange={setTimeMs}
          onRankChange={setRank}
        />

        <div>
          <label className="filter-label" htmlFor="sf-reason">Alasan Perubahan (opsional)</label>
          <input
            id="sf-reason"
            className="input-control"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan perubahan skor…"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting || !entityKey}>
            {isSubmitting ? 'Menyimpan…' : editingScore ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ScoreForm;
