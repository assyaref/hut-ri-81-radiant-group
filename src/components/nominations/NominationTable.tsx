import NominationStatusBadge from './NominationStatusBadge';
import type { Nomination } from '../../types/hutRi';

interface NominationTableProps {
  nominations: Nomination[];
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  canManage: boolean;
}

const categoryLabels: Record<string, string> = {
  JUARA_1: 'Juara 1',
  JUARA_2: 'Juara 2',
  JUARA_3: 'Juara 3',
  BEST_TEAM: 'Tim Terbaik',
  BEST_YEL_YEL: 'Yel-Yel Terbaik',
};

function NominationTable({ nominations, onConfirm, onReject, canManage }: NominationTableProps) {
  if (nominations.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada nominasi.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Peserta / Tim</th>
            <th>Perlombaan</th>
            <th>Kategori</th>
            <th>Status</th>
            {canManage && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {nominations.map((nom, index) => (
            <tr key={nom.id}>
              <td>{index + 1}</td>
              <td className="font-medium text-navy-900">
                {nom.participantName || nom.teamName || nom.participantId || nom.teamId || '—'}
              </td>
              <td>{nom.competitionName || nom.competitionId}</td>
              <td>{categoryLabels[nom.category] || nom.category}</td>
              <td><NominationStatusBadge status={nom.status} /></td>
              {canManage && (
                <td>
                  {nom.status === 'NOMINATED' && (
                    <div className="flex gap-2">
                      <button className="btn-link" onClick={() => onConfirm(nom.id)}>Konfirmasi</button>
                      <button className="btn-link" onClick={() => onReject(nom.id)}>Tolak</button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NominationTable;
