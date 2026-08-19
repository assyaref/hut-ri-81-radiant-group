import Badge from '../ui/Badge';
import type { TeamMember } from '../../types/hutRi';

interface TeamMemberListProps {
  members: TeamMember[];
  captainParticipantId: string;
  onSetCaptain?: (participantId: string) => void;
  onRemove?: (participantId: string) => void;
  canManage: boolean;
}

function TeamMemberList({ members, captainParticipantId, onSetCaptain, onRemove, canManage }: TeamMemberListProps) {
  if (members.length === 0) {
    return <div className="text-center py-8 text-gray-500">Belum ada anggota tim.</div>;
  }

  return (
    <ul className="space-y-3">
      {members.map((m) => {
        const name = m.participant?.name || m.participantId;
        const dept = m.participant?.department || '';
        const isCaptain = m.participantId === captainParticipantId;
        return (
          <li key={m.id} className="activity-item">
            <span className="activity-icon">{isCaptain ? '👑' : '👤'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy-900 truncate">
                {name} {isCaptain && <Badge variant="gold">Kapten</Badge>}
              </p>
              {dept && <p className="text-xs text-gray-500 truncate">{dept}</p>}
            </div>
            {canManage && (
              <div className="flex gap-2">
                {!isCaptain && onSetCaptain && (
                  <button className="btn-link" onClick={() => onSetCaptain(m.participantId)}>Jadikan Kapten</button>
                )}
                {onRemove && (
                  <button className="btn-link" onClick={() => onRemove(m.participantId)}>Hapus</button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default TeamMemberList;
