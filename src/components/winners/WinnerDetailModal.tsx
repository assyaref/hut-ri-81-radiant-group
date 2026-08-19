import type { Winner } from '../../types/hutRi';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

interface WinnerDetailModalProps {
  winner: Winner | null;
  onClose: () => void;
}

function row(label: string, value: string) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  );
}

function WinnerDetailModal({ winner, onClose }: WinnerDetailModalProps) {
  return (
    <Modal open={!!winner} title="Detail Pemenang" onClose={onClose}>
      {winner && (
        <div className="space-y-2">
          {row('Nama', winner.participantName)}
          {row('Departemen', winner.department)}
          {row('Kode Unik', winner.uniqueCode)}
          <div className="detail-row">
            <span className="detail-label">Hadiah</span>
            <Badge variant="gold">{winner.prizeName}</Badge>
          </div>
          {row('Waktu Menang', winner.wonAt)}
          {row('Status', winner.status)}
          {row('ID', winner.id)}
        </div>
      )}
    </Modal>
  );
}

export default WinnerDetailModal;