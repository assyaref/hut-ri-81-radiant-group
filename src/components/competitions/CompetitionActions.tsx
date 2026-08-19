import Button from '../ui/Button';
import type { Competition } from '../../types/hutRi';

interface CompetitionActionsProps {
  competition: Competition;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onView: () => void;
}

function CompetitionActions({
  competition,
  onEdit,
  onDelete,
  onStart,
  onFinish,
  onCancel,
  onView,
}: CompetitionActionsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" variant="secondary" onClick={onView} ariaLabel="Lihat detail">
        Detail
      </Button>

      {(competition.status === 'DRAFT' || competition.status === 'READY') && (
        <>
          <Button size="sm" variant="primary" onClick={onEdit} ariaLabel="Edit">
            Edit
          </Button>
          <Button size="sm" variant="success" onClick={onStart} ariaLabel="Mulai">
            Mulai
          </Button>
        </>
      )}

      {competition.status === 'RUNNING' && (
        <Button size="sm" variant="success" onClick={onFinish} ariaLabel="Selesaikan">
          Selesai
        </Button>
      )}

      {(competition.status === 'READY' || competition.status === 'RUNNING') && (
        <Button size="sm" variant="warning" onClick={onCancel} ariaLabel="Batalkan">
          Batal
        </Button>
      )}

      {(competition.status === 'DRAFT' || competition.status === 'CANCELLED') && (
        <Button size="sm" variant="danger" onClick={onDelete} ariaLabel="Hapus">
          Hapus
        </Button>
      )}
    </div>
  );
}

export default CompetitionActions;
