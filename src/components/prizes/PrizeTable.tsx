import type { Prize } from '../../types/hutRi';
import Badge from '../ui/Badge';

interface PrizeTableProps {
  prizes: Prize[];
  onDetail: (prize: Prize) => void;
  onEdit?: (prize: Prize) => void;
  onDelete?: (prize: Prize) => void;
  canManage: boolean;
}

function PrizeTable({ prizes, onDetail, onEdit, onDelete, canManage }: PrizeTableProps) {
  if (prizes.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada hadiah.</div>;
  }
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Hadiah</th>
            <th>Jumlah</th>
            <th>Tersisa</th>
            <th>Diberikan</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {prizes.map((p) => {
            const awarded = p.quantity - p.available;
            return (
              <tr key={p.id}>
                <td className="font-medium text-navy-900">{p.name}</td>
                <td>{p.quantity}</td>
                <td className="font-semibold text-green-600">{p.available}</td>
                <td>{awarded}</td>
                <td>
                  <Badge variant={p.available > 0 ? 'success' : 'default'}>
                    {p.available > 0 ? 'Tersedia' : 'Habis'}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2 justify-end">
                    <button className="btn-link" onClick={() => onDetail(p)}>Detail</button>
                    {canManage && onEdit && (
                      <button className="btn-link" onClick={() => onEdit(p)}>Edit</button>
                    )}
                    {canManage && onDelete && (
                      <button className="btn-link text-red-600" onClick={() => onDelete(p)}>Hapus</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PrizeTable;