import Badge from '../ui/Badge';
import type { Nomination } from '../../types/hutRi';

interface NominationCardProps {
  nomination: Nomination;
}

const categoryLabels: Record<string, string> = {
  JUARA_1: 'Juara 1',
  JUARA_2: 'Juara 2',
  JUARA_3: 'Juara 3',
  BEST_TEAM: 'Tim Terbaik',
  BEST_YEL_YEL: 'Yel-Yel Terbaik',
};

function NominationCard({ nomination }: NominationCardProps) {
  const name = nomination.participantName || nomination.teamName || '—';
  return (
    <div className="winner-badge">
      <div className="winner-badge-top">NOMINASI</div>
      <div className="winner-badge-body">
        <div className="winner-badge-icon">⭐</div>
        <p className="winner-badge-name">{name}</p>
        <p className="winner-badge-dept">
          {nomination.department || nomination.competitionName || ''}
        </p>
        <div className="winner-badge-prize">
          <span>Kategori</span>
          <strong>{categoryLabels[nomination.category] || nomination.category}</strong>
        </div>
        <Badge variant="gold">{nomination.status}</Badge>
      </div>
    </div>
  );
}

export default NominationCard;
