import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import QuickAction from '../components/dashboard/QuickAction';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { LoadingState, ErrorState } from '../components/ui/Feedback';
import type { EventStatistics, CompetitionStatistics, QuickAction as QuickActionType, Statistic } from '../types/hutRi';
import api from '../services/api';

function formatTime(value: string): string {
  if (!value) return '\u2014'; 
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function RecentBlock(props: { title: string; empty: string; onClickMore: () => void; children: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900">{props.title}</h3>
        <button className="btn-link" onClick={props.onClickMore}>Lihat Semua</button>
      </div>
      <ul className="space-y-3">
        {React.Children.count(props.children) > 0 ? props.children : (
          <li className="text-sm text-gray-500">{props.empty}</li>
        )}
      </ul>
    </Card>
  );
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [compStats, setCompStats] = useState<CompetitionStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [result, compResult] = await Promise.all([
          api.getStatistics(),
          api.getCompetitionStatistics(),
        ]);
        if (result.success) setStats(result.data);
        else setError(result.message);
        if (compResult.success) setCompStats(compResult.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat statistik.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards: Statistic[] = [
    { label: 'Total Peserta', value: stats?.totalParticipants ?? 0, icon: '\uD83D\uDC65' },
    { label: 'Check-in', value: stats?.totalCheckedIn ?? 0, icon: '' },
    { label: 'Belum Check-in', value: stats?.totalPending ?? 0, icon: '' },
    { label: 'Hadiah', value: stats?.totalPrizes ?? 0, icon: '\uD83C\uDF81' },
    { label: 'Hadiah Tersedia', value: stats?.availablePrizes ?? 0, icon: '\uD83D\uDC9D' },
    { label: 'Hadiah Diberikan', value: stats?.awardedPrizes ?? 0, icon: '\uD83C\uDF89' },
    { label: 'Total Pemenang', value: stats?.totalWinners ?? 0, icon: '\uD83C\uDFC6' },
    { label: 'Perlombaan', value: compStats?.totalCompetitions ?? 0, icon: '🏁' },
    { label: 'Berjalan', value: compStats?.runningCompetitions ?? 0, icon: '🔴' },
    { label: 'Selesai', value: compStats?.finishedCompetitions ?? 0, icon: '✅' },
    { label: 'Total Skor', value: compStats?.totalScores ?? 0, icon: '📈' },
    { label: 'Nominasi', value: compStats?.totalNominations ?? 0, icon: '⭐' },
    { label: 'Pemenang Lomba', value: compStats?.competitionWinners ?? 0, icon: '🏅' },
  ];

  const quickActions: QuickActionType[] = [
    { label: 'Registrasi', path: '/registration', icon: '\uD83D\uDCDD', color: 'red' },
    { label: 'Check-in', path: '/checkin', icon: '\u2713', color: 'green' },
    { label: 'Spin Draw', path: '/spin', icon: '\uD83C\uDFB0', color: 'gold' },
    { label: 'Pemenang', path: '/winners', icon: '\uD83C\uDFC6', color: 'navy' },
    { label: 'Lomba Baru', path: '/competitions', icon: '🏁', color: 'red' },
    { label: 'Input Skor', path: '/scoring', icon: '📈', color: 'green' },
    { label: 'Live Monitor', path: '/live-competition', icon: '📺', color: 'gold' },
    { label: 'Nominasi', path: '/nominations', icon: '⭐', color: 'navy' },
  ];

  const progress = stats && stats.totalParticipants > 0 ? Math.round((stats.totalCheckedIn / stats.totalParticipants) * 100) : 0;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">HUT RI KE-81</h1>
        <p className="text-gray-600 text-lg">Radiant Group - Merdeka!</p>
      </div>

      {isLoading ? (
        <Card><LoadingState label="Memuat dashboard\u2026" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={() => { setError(''); setIsLoading(true); }} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
            <Card className="flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium mb-2">Progres Check-in</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-navy-900">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: progress + '%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">{stats?.totalCheckedIn ?? 0} dari {stats?.totalParticipants ?? 0} peserta</p>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <QuickAction key={index} action={action} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentBlock title="Registrasi Terbaru" empty="Belum ada peserta." onClickMore={() => navigate('/participants')}>
              {stats?.recentParticipants?.map((p) => (
                <li key={p.id} className="activity-item">
                  <span className="activity-icon">R</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.department} - {p.uniqueCode}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(p.registeredAt)}</span>
                </li>
              ))}
            </RecentBlock>

            <RecentBlock title="Check-in Terbaru" empty="Belum ada check-in." onClickMore={() => navigate('/participants')}>
              {stats?.recentCheckins?.map((p) => (
                <li key={p.id} className="activity-item">
                  <span className="activity-icon">C</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.department}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(p.checkedInAt)}</span>
                </li>
              ))}
            </RecentBlock>

            <RecentBlock title="Pemenang Terbaru" empty="Belum ada pemenang." onClickMore={() => navigate('/winners')}>
              {stats?.recentWinners?.map((w) => (
                <li key={w.id} className="activity-item">
                  <span className="activity-icon">T</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 truncate">{w.participantName}</p>
                    <p className="text-xs text-gray-500 truncate">{w.department}</p>
                  </div>
                  <Badge variant="gold">{w.prizeName}</Badge>
                </li>
              ))}
            </RecentBlock>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-xl mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Selamat Memperingati HUT RI ke-81!</h2>
                <p className="text-red-100">Mari kita terus jaga persatuan dan kesatuan bangsa Indonesia. Merdeka!</p>
              </div>
              <div className="text-6xl">\uD83C\uDF89</div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;

