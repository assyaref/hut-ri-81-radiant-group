import Badge from '../ui/Badge';
import type { CompetitionType } from '../../types/hutRi';

interface CompetitionTypeBadgeProps {
  type: CompetitionType;
}

const typeConfig: Record<CompetitionType, { variant: 'info' | 'warning' | 'success'; label: string }> = {
  INDIVIDUAL: { variant: 'info', label: 'Individu' },
  GROUP: { variant: 'warning', label: 'Kelompok' },
  BOTH: { variant: 'success', label: 'Keduanya' },
};

function CompetitionTypeBadge({ type }: CompetitionTypeBadgeProps) {
  const config = typeConfig[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default CompetitionTypeBadge;
