import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WinnerTable from '../components/winners/WinnerTable';
import WinnerDetailModal from '../components/winners/WinnerDetailModal';
import WinnerBadge from '../components/winners/WinnerBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import type { Winner } from '../types/hutRi';
import api from '../services/api';

function downloadCsv(rows: Winner[]) {
  const header = ['Nama', 'Departemen', 'Kode Unik', 'Hadiah', 'Waktu Menang', 'Status'];
  const lines = rows.map((w) =>
    [w.participantName, w.department, w.uniqueCode, w.prizeName, w.wonAt, w.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pemenang.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [prizeFilter, setPrizeFilter] = useState('');
  const [detail, setDetail] = useState<Winner | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getWinners();
      if (result.success) setWinners(Array.isArray(result.data) ? result.data : []);
      else setError(result.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pemenang.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const prizeNames = useMemo(
    () => Array.from(new Set(winners.map((w) => w.prizeName).filter(Boolean))).sort(),
    [winners],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return winners.filter((w) => {
      const matchesQ =
        !q ||
        w.participantName.toLowerCase().includes(q) ||
        w.uniqueCode.toLowerCase().includes(q);
      const matchesPrize = !prizeFilter || w.prizeName === prizeFilter;
      return matchesQ && matchesPrize;
    });
  }, [winners, query, prizeFilter]);

  const handlePrint = () => {
    setPrintOpen(true);
    window.setTimeout(() => window.print(), 50);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 print-hide">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Manajemen Pemenang</h1>
          <p className="text-gray-500">Daftar pemenang undian HUT RI Ke-81.</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button variant="outline" onClick={handlePrint}>🖨️ Print</Button>
          <Button variant="secondary" onClick={() => downloadCsv(filtered)}>Export CSV</Button>
        </div>
      </div>

      <Card className="mb-6 print-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="w-search">Cari Pemenang</label>
            <input
              id="w-search"
              className="input-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nama atau kode unik…"
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="w-prize">Filter Hadiah</label>
            <select
              id="w-prize"
              className="input-control"
              value={prizeFilter}
              onChange={(e) => setPrizeFilter(e.target.value)}
            >
              <option value="">Semua Hadiah</option>
              {prizeNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Printable badge grid */}
      {printOpen && (
        <div className="print-only">
          <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">DAFTAR PEMENANG HUT RI KE-81</h2>
          <div className="print-grid">
            {filtered.map((w) => <WinnerBadge key={w.id} winner={w} />)}
          </div>
        </div>
      )}

      {isLoading ? (
        <Card print-hide><LoadingState label="Memuat pemenang…" /></Card>
      ) : error ? (
        <Card print-hide><ErrorState message={error} onRetry={load} /></Card>
      ) : filtered.length === 0 ? (
        <Card print-hide><EmptyState title="Tidak ada pemenang" description="Belum ada pemenang yang tercatat." /></Card>
      ) : (
        <Card className="p-0 print-hide">
          <WinnerTable winners={filtered} onSelect={setDetail} />
        </Card>
      )}

      <WinnerDetailModal winner={detail} onClose={() => setDetail(null)} />
    </Layout>
  );
}

export default WinnersPage;