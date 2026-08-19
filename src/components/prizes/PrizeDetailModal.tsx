import type { Prize } from '../../types/hutRi';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

interface PrizeDetailModalProps {
  prize: Prize | null;
  onClose: () => void;
}

function row(label: string, value: string | number) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function PrizeDetailModal({ prize, onClose }: PrizeDetailModalProps) {
  return (
    <Modal open={!!prize} title="Detail Hadiah" onClose={onClose}>
      {prize && (
        <div className="space-y-2">
          {row('Nama', prize.name)}
          {row('Deskripsi', prize.description || '—')}
          {row('Jumlah', prize.quantity)}
          {row('Tersisa', prize.available)}
          {row('Diberikan', prize.quantity - prize.available)}
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <Badge variant={prize.available > 0 ? 'success' : 'default'}>
              {prize.available > 0 ? 'Tersedia' : 'Habis'}
            </Badge>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default PrizeDetailModal;