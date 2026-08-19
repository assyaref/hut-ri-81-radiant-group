import type { Winner } from '../../types/hutRi';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

interface WinnerResultProps {
  winner: Winner | null;
  onClose: () => void;
}

function WinnerResult({ winner, onClose }: WinnerResultProps) {
  return (
    <Modal open={!!winner} title="🎉 Selamat! Pemenang" onClose={onClose}>
      {winner && (
        <div className="text-center py-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white flex items-center justify-center text-5xl shadow-lg">
            🏆
          </div>
          <h3 className="text-3xl font-bold text-navy-900 mb-1">{winner.participantName}</h3>
          <p className="text-gray-500 mb-4">{winner.department}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            <div className="detail-row">
              <span className="detail-label">Hadiah</span>
              <Badge variant="gold">{winner.prizeName}</Badge>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kode Unik</span>
              <span className="detail-value font-mono text-red-600">{winner.uniqueCode}</span>
            </div>
          </div>
          <button className="btn-outline-small" onClick={onClose}>Tutup</button>
        </div>
      )}
    </Modal>
  );
}

export default WinnerResult;