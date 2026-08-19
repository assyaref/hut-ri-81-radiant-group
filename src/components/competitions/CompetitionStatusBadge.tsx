import Badge from '../ui/Badge';
import type { CompetitionStatus } from '../../types/hutRi';

interface CompetitionStatusBadgeProps {
  status: CompetitionStatus;
}

const statusConfig: Record<
  CompetitionStatus,
  { variant: 'default' | 'success' | 'warning' | 'info' | 'error'; label: string }
> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  READY: { variant: 'warning', label: 'Siap' },
  RUNNING: { variant: 'success', label: 'Berjalan' },
  FINISHED: { variant: 'info', label: 'Selesai' },
  CANCELLED: { variant: 'error', label: 'Dibatalkan' },
};

function CompetitionStatusBadge({ status }: CompetitionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default CompetitionStatusBadge;
