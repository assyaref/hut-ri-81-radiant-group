import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { livePolling } from '../services/livePolling';
import type { CompetitionWinner, LeaderboardEntry, Nomination } from '../types/hutRi';
import api from '../services/api';

type LiveMode = 'COMPETITION' | 'LEADERBOARD' | 'NOMINATION' | 'WINNER';

const MODES: { key: LiveMode; label: string }[] = [
  { key: 'COMPETITION', label: 'Live' },
  { key: 'LEADERBOARD', label: 'Leaderboard' },
  { key: 'NOMINATION', label: 'Nominasi' },
  { key: 'WINNER', label: 'Pemenang' },
];

const medals = ['🥇', '🥈', '🥉'];

const categoryLabels: Record<string, string> = {
  JUARA_1: 'Juara 1',
  JUARA_2: 'Juara 2',
  JUARA_3: 'Juara 3',
  BEST_TEAM: 'Tim Terbaik',
  BEST_YEL_YEL: 'Yel-Yel Terbaik',
};

function formatTime(ms: number): string {
  const seconds = ms / 1000;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(mins)}:${secs.toFixed(2).padStart(5, '0')}`;
}

function LiveCompetitionPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LiveMode>('LEADERBOARD');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [lbRes, winRes, nomRes] = await Promise.all([
          api.getLiveLeaderboard(),
          api.getLiveWinners(),
          api.getLiveNominations(),
        ]);
        if (lbRes.success) setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
        if (winRes.success) setWinners(Array.isArray(winRes.data) ? winRes.data : []);
        if (nomRes.success) setNominations(Array.isArray(nomRes.data) ? nomRes.data : []);
      } catch {
        /* keep last data on error */
      }
    };
    livePolling.start('live-competition', load, () => {}, { interval: 5000 });
    return () => livePolling.stop('live-competition');
  }, []);

  useEffect(() => {
    if (mode === 'WINNER' && winners.length > 1) {
      const t = setInterval(() => setWinnerIndex((i) => (i + 1) % winners.length), 6000);
      return () => clearInterval(t);
    }
    setWinnerIndex(0);
  }, [mode, winners.length]);

  const top3 = leaderboard.slice(0, 3);
  const currentWinner = winners.length > 0 ? winners[winnerIndex % winners.length] : null;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 30%, #0f172a 100%)' }}
    >
      <header
        className="py-6 px-8 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '2px solid #d4af37' }}
      >
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>HUT RI KE-81</h1>
          <p className="text-xl" style={{ color: '#d4af37' }}>× RADIANT GROUP</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  background: mode === m.key ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: mode === m.key ? '#000' : '#fff',
                }}
                className="px-4 py-2 rounded-lg font-semibold"
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 rounded-lg font-semibold"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            aria-label="Tutup monitor"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 pb-24">
        {mode === 'LEADERBOARD' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full font-bold text-lg" style={{ background: '#d32f2f' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: '#fff' }} />
                LIVE
              </div>
              <h2 className="text-5xl font-bold mt-4">LEADERBOARD</h2>
            </div>
            <div className="space-y-4">
              {top3.map((entry, i) => (
                <div
                  key={`${entry.competitionId}-${entry.id}`}
                  className="flex items-center gap-6 p-6 rounded-2xl"
                  style={{ background: i === 0 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.1)' }}
                >
                  <span className="text-5xl">{medals[i]}</span>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{entry.name}</p>
                    <p className="text-gray-300">{entry.department} · {entry.competitionName}</p>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>
                    {entry.timeMs != null ? formatTime(entry.timeMs) : `${entry.score ?? 0} POINTS`}
                  </span>
                </div>
              ))}
              {top3.length === 0 && <p className="text-center text-gray-300 text-xl">Belum ada peringkat.</p>}
            </div>
          </div>
        )}

        {mode === 'COMPETITION' && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full font-bold text-lg" style={{ background: '#d32f2f' }}>
                <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#fff' }} />
                LIVE COMPETITION
              </div>
              <h2 className="text-5xl font-bold mt-4">SEDANG BERLANGSUNG</h2>
            </div>
            <div className="max-w-2xl mx-auto rounded-2xl p-8" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <h3 className="text-3xl font-bold text-center mb-8">Peringkat Saat Ini</h3>
              {top3.map((entry, i) => (
                <div key={`${entry.competitionId}-${entry.id}`} className="flex items-center gap-6 mb-6 last:mb-0">
                  <span className="text-5xl">{medals[i]}</span>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold">{entry.name}</p>
                    <p className="text-gray-400">{entry.department}</p>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>
                    {entry.timeMs != null ? formatTime(entry.timeMs) : `${entry.score ?? 0} pts`}
                  </span>
                </div>
              ))}
              {top3.length === 0 && <p className="text-center text-gray-300">Belum ada data.</p>}
            </div>
          </div>
        )}

        {mode === 'NOMINATION' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-5xl font-bold">⭐ NOMINASI ⭐</h2>
              <p className="text-xl text-gray-300 mt-2">Kandidat Pemenang</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nominations.slice(0, 9).map((nom) => (
                <div key={nom.id} className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4" style={{ background: '#d4af37', color: '#000' }}>
                    {categoryLabels[nom.category] || nom.category}
                  </span>
                  <h3 className="text-2xl font-bold">{nom.participantName || nom.teamName || '—'}</h3>
                  <p className="text-gray-300">{nom.competitionName || ''}</p>
                </div>
              ))}
              {nominations.length === 0 && <p className="text-center text-gray-300 text-xl">Belum ada nominasi.</p>}
            </div>
          </div>
        )}

        {mode === 'WINNER' && currentWinner && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-8xl mb-6">🏆</div>
              <h2 className="text-6xl font-bold mb-4" style={{ color: '#d4af37' }}>JUARA {currentWinner.position}</h2>
              <p className="text-4xl font-bold mb-2">{currentWinner.participantName || currentWinner.teamName || '—'}</p>
              <p className="text-xl text-gray-300 mb-2">{currentWinner.competitionName || ''}</p>
              <p className="text-3xl font-bold" style={{ color: '#d4af37' }}>
                {currentWinner.score != null ? `${currentWinner.score} POINTS` : ''}
              </p>
            </div>
          </div>
        )}
        {mode === 'WINNER' && !currentWinner && (
          <p className="text-center text-gray-300 text-2xl pt-20">Belum ada pemenang dikonfirmasi.</p>
        )}
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 py-4 px-8 flex justify-between items-center text-gray-400"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <p>RADIANT GROUP • HUT RI KE-81</p>
        <p>Live Update · {new Date().toLocaleTimeString('id-ID')}</p>
      </footer>
    </div>
  );
}

export default LiveCompetitionPage;
