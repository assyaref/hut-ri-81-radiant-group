import Badge from '../ui/Badge';
import type { Team } from '../../types/hutRi';

interface TeamTableProps {
  teams: Team[];
  onView: (team: Team) => void;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
  onDisqualify: (id: string) => void;
  canManage: boolean;
}

const statusVariant: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DISQUALIFIED: 'error',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  DISQUALIFIED: 'Diskualifikasi',
};

function TeamTable({ teams, onView, onEdit, onDelete, onDisqualify, canManage }: TeamTableProps) {
  if (teams.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada tim.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Tim</th>
            <th>Departemen</th>
            <th>Anggota</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>
                <button className="btn-link" onClick={() => onView(team)}>
                  {team.name}
                </button>
              </td>
              <td>{team.department || '—'}</td>
              <td>{team.memberCount ?? team.members?.length ?? 0}</td>
              <td>
                <Badge variant={statusVariant[team.status] || 'warning'}>
                  {statusLabel[team.status] || team.status}
                </Badge>
              </td>
              <td>
                {canManage && (
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn-link" onClick={() => onView(team)}>Detail</button>
                    {team.status !== 'DISQUALIFIED' && (
                      <button className="btn-link" onClick={() => onEdit(team)}>Edit</button>
                    )}
                    {team.status === 'ACTIVE' && (
                      <button className="btn-link" onClick={() => onDisqualify(team.id)}>Diskualifikasi</button>
                    )}
                    <button className="btn-link" onClick={() => onDelete(team.id)}>Hapus</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamTable;
