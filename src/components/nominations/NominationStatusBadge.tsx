import Badge from '../ui/Badge';
import type { NominationStatus } from '../../types/hutRi';

interface NominationStatusBadgeProps {
  status: NominationStatus;
}

const config: Record<NominationStatus, { variant: 'warning' | 'success' | 'error'; label: string }> = {
  NOMINATED: { variant: 'warning', label: 'Terinominasi' },
  CONFIRMED: { variant: 'success', label: 'Terkonfirmasi' },
  REJECTED: { variant: 'error', label: 'Ditolak' },
};

function NominationStatusBadge({ status }: NominationStatusBadgeProps) {
  const c = config[status] || config.NOMINATED;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default NominationStatusBadge;
