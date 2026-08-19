import type { Participant } from '../../types/hutRi';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

interface ParticipantDetailModalProps {
  participant: Participant | null;
  onClose: () => void;
}

function field(label: string, value: string, mono = false) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${mono ? 'font-mono text-red-600' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function ParticipantDetailModal({ participant, onClose }: ParticipantDetailModalProps) {
  return (
    <Modal open={!!participant} title="Detail Peserta" onClose={onClose}>
      {participant && (
        <div className="space-y-2">
          {field('Nama', participant.name)}
          {field('Departemen', participant.department)}
          {field('Kode Unik', participant.uniqueCode, true)}
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <Badge variant={participant.status === 'CHECKED_IN' ? 'success' : 'warning'}>
              {participant.status}
            </Badge>
          </div>
          {field('Waktu Daftar', participant.registeredAt)}
          {field('Waktu Check-in', participant.checkedInAt)}
          {field('ID', participant.id, true)}
        </div>
      )}
    </Modal>
  );
}

export default ParticipantDetailModal;