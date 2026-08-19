import Badge from '../ui/Badge';
import type { ScoringMethod } from '../../types/hutRi';

interface ScoringMethodBadgeProps {
  method: ScoringMethod;
}

const config: Record<ScoringMethod, { variant: 'info' | 'warning' | 'gold'; label: string }> = {
  SCORE: { variant: 'info', label: 'Skor' },
  RANK: { variant: 'warning', label: 'Peringkat' },
  TIME: { variant: 'gold', label: 'Waktu' },
};

function ScoringMethodBadge({ method }: ScoringMethodBadgeProps) {
  const c = config[method] || config.SCORE;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default ScoringMethodBadge;
