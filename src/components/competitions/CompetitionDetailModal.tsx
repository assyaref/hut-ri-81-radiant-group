import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CompetitionStatusBadge from './CompetitionStatusBadge';
import CompetitionTypeBadge from './CompetitionTypeBadge';
import type { Competition } from '../../types/hutRi';

interface CompetitionDetailModalProps {
  competition: Competition | null;
  onClose: () => void;
  onOpenPage: (id: string) => void;
}

const scoringMethodLabels: Record<string, string> = {
  SCORE: 'Point (Skor)',
  RANK: 'Peringkat',
  TIME: 'Waktu',
};

function formatDateTime(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CompetitionDetailModal({ competition, onClose, onOpenPage }: CompetitionDetailModalProps) {
  return (
    <Modal
      open={!!competition}
      title={competition ? competition.title : 'Detail Perlombaan'}
      onClose={onClose}
    >
      {competition && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <CompetitionTypeBadge type={competition.type} />
            <CompetitionStatusBadge status={competition.status} />
          </div>

          {competition.description && (
            <p className="text-gray-600">{competition.description}</p>
          )}

          <div>
            <div className="detail-row">
              <span className="detail-label">Metode Scoring</span>
              <span className="detail-value">{scoringMethodLabels[competition.scoringMethod] || competition.scoringMethod}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Maks. Peserta</span>
              <span className="detail-value">{competition.maxParticipants}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Maks. Anggota Tim</span>
              <span className="detail-value">{competition.maxGroupSize}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Peserta Terdaftar</span>
              <span className="detail-value">{competition.participantCount ?? 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tim</span>
              <span className="detail-value">{competition.teamCount ?? 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Waktu Mulai</span>
              <span className="detail-value">{formatDateTime(competition.startTime)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Waktu Selesai</span>
              <span className="detail-value">{formatDateTime(competition.endTime)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Tutup</Button>
            <Button onClick={() => onOpenPage(competition.id)}>Buka Halaman Lengkap</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CompetitionDetailModal;
