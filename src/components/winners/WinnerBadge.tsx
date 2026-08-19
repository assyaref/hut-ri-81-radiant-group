import type { Winner } from '../../types/hutRi';

/**
 * A printable badge card showing a winner. Used by the Winners page print / export.
 */
interface WinnerBadgeProps {
  winner: Winner;
}

function WinnerBadge({ winner }: WinnerBadgeProps) {
  return (
    <div className="winner-badge">
      <div className="winner-badge-top">
        <span>HUT RI KE-81 RADIANT GROUP</span>
      </div>
      <div className="winner-badge-body">
        <div className="winner-badge-icon">🏆</div>
        <p className="winner-badge-name">{winner.participantName}</p>
        <p className="winner-badge-dept">{winner.department}</p>
        <div className="winner-badge-prize">
          <span>Memenangkan</span>
          <strong>{winner.prizeName}</strong>
        </div>
        <p className="winner-badge-code">{winner.uniqueCode}</p>
      </div>
    </div>
  );
}

export default WinnerBadge;