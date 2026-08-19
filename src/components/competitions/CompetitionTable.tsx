import type { Competition } from '../../types/hutRi';
import CompetitionStatusBadge from './CompetitionStatusBadge';
import CompetitionTypeBadge from './CompetitionTypeBadge';
import CompetitionActions from './CompetitionActions';

interface CompetitionTableProps {
  competitions: Competition[];
  onEdit: (competition: Competition) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onFinish: (id: string) => void;
  onCancel: (id: string) => void;
  onView: (competition: Competition) => void;
}

const scoringMethodLabels: Record<string, string> = {
  SCORE: 'Skor',
  RANK: 'Peringkat',
  TIME: 'Waktu',
};

function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CompetitionTable({
  competitions,
  onEdit,
  onDelete,
  onStart,
  onFinish,
  onCancel,
  onView,
}: CompetitionTableProps) {
  if (competitions.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada perlombaan.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Perlombaan</th>
            <th>Tipe</th>
            <th>Status</th>
            <th>Scoring</th>
            <th>Peserta</th>
            <th>Mulai</th>
            <th>Selesai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((competition, index) => (
            <tr key={competition.id}>
              <td>{index + 1}</td>
              <td>
                <button className="btn-link" onClick={() => onView(competition)}>
                  {competition.title}
                </button>
                <div className="text-xs text-gray-500">{competition.description}</div>
              </td>
              <td>
                <CompetitionTypeBadge type={competition.type} />
              </td>
              <td>
                <CompetitionStatusBadge status={competition.status} />
              </td>
              <td>{scoringMethodLabels[competition.scoringMethod] || competition.scoringMethod}</td>
              <td>{competition.participantCount ?? 0}</td>
              <td>{formatDateTime(competition.startTime)}</td>
              <td>{formatDateTime(competition.endTime)}</td>
              <td>
                <CompetitionActions
                  competition={competition}
                  onEdit={() => onEdit(competition)}
                  onDelete={() => onDelete(competition.id)}
                  onStart={() => onStart(competition.id)}
                  onFinish={() => onFinish(competition.id)}
                  onCancel={() => onCancel(competition.id)}
                  onView={() => onView(competition)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompetitionTable;
