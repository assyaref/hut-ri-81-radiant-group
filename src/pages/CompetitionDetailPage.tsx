import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CompetitionStatusBadge from '../components/competitions/CompetitionStatusBadge';
import CompetitionTypeBadge from '../components/competitions/CompetitionTypeBadge';
import CompetitionParticipants from '../components/competitions/CompetitionParticipants';
import TeamTable from '../components/teams/TeamTable';
import TeamForm from '../components/teams/TeamForm';
import TeamDetail from '../components/teams/TeamDetail';
import ScoreTable from '../components/scoring/ScoreTable';
import ScoreForm from '../components/scoring/ScoreForm';
import type { ScorePayload } from '../components/scoring/ScoreForm';
import ScoreHistory from '../components/scoring/ScoreHistory';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import NominationTable from '../components/nominations/NominationTable';
import { LoadingState, ErrorState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type {
  Competition,
  CompetitionParticipant,
  LeaderboardEntry,
  Nomination,
  Score,
  ScoreHistory as ScoreHistoryType,
  Team,
} from '../types/hutRi';
import api from '../services/api';

type TabKey = 'overview' | 'participants' | 'teams' | 'scoring' | 'ranking' | 'nominations';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Ringkasan' },
  { key: 'participants', label: 'Peserta' },
  { key: 'teams', label: 'Tim' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'ranking', label: 'Peringkat' },
  { key: 'nominations', label: 'Nominasi' },
];

function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { notify } = useToast();
  const canManage = hasRole('OPERATOR');
  const canNominate = hasRole('ADMIN');

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<CompetitionParticipant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [history, setHistory] = useState<ScoreHistoryType[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('overview');

  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamDetail, setTeamDetail] = useState<Team | null>(null);
  const [scoreFormOpen, setScoreFormOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  const loadAll = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const [compRes, cpRes, teamsRes, scoresRes, lbRes, nomRes] = await Promise.all([
        api.getCompetition(id),
        api.getCompetitionParticipants(id),
        api.getTeams(id),
        api.getScores(id),
        api.getLeaderboard(id),
        api.getNominations(id),
      ]);
      if (compRes.success) setCompetition(compRes.data);
      else setError(compRes.message);
      if (cpRes.success) setParticipants(Array.isArray(cpRes.data) ? cpRes.data : []);
      if (teamsRes.success) setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      if (scoresRes.success) setScores(Array.isArray(scoresRes.data) ? scoresRes.data : []);
      if (lbRes.success) setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
      if (nomRes.success) setNominations(Array.isArray(nomRes.data) ? nomRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat detail perlombaan.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadHistory = async () => {
    if (!id) return;
    const res = await api.getScoreHistory(id);
    if (res.success) setHistory(Array.isArray(res.data) ? res.data : []);
  };

  const changeStatus = async (fn: (cid: string) => Promise<{ success: boolean; message: string }>, label: string) => {
    if (!id) return;
    const res = await fn(id);
    if (res.success) { notify('success', label); loadAll(); }
    else notify('error', res.message);
  };

  const handleTeamSubmit = async (data: { name: string; department: string }) => {
    if (!competition) return;
    const res = editingTeam
      ? await api.updateTeam(editingTeam.id, data)
      : await api.createTeam({ ...data, competitionId: competition.id, captainParticipantId: '', status: 'ACTIVE' });
    if (res.success) { notify('success', editingTeam ? 'Tim diperbarui.' : 'Tim dibuat.'); loadAll(); }
    else notify('error', res.message);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Yakin ingin menghapus tim ini?')) return;
    const res = await api.deleteTeam(teamId);
    if (res.success) { notify('success', 'Tim dihapus.'); loadAll(); }
    else notify('error', res.message);
  };

  const handleDisqualifyTeam = async (teamId: string) => {
    if (!confirm('Diskualifikasi tim ini?')) return;
    const res = await api.disqualifyTeam(teamId);
    if (res.success) { notify('success', 'Tim didiskualifikasi.'); loadAll(); }
    else notify('error', res.message);
  };

  const handleScoreSubmit = async (data: ScorePayload, reason: string) => {
    if (editingScore) {
      const res = await api.updateScore(editingScore.id, data, reason);
      if (res.success) { notify('success', 'Skor diperbarui.'); loadAll(); }
      else notify('error', res.message);
    } else {
      const res = await api.saveScore(data);
      if (res.success) { notify('success', 'Skor disimpan.'); loadAll(); }
      else notify('error', res.message);
    }
  };

  const handleConfirmNomination = async (nomId: string) => {
    const res = await api.confirmNomination(nomId);
    if (res.success) { notify('success', 'Nominasi dikonfirmasi.'); loadAll(); }
    else notify('error', res.message);
  };

  const handleRejectNomination = async (nomId: string) => {
    const res = await api.rejectNomination(nomId);
    if (res.success) { notify('success', 'Nominasi ditolak.'); loadAll(); }
    else notify('error', res.message);
  };

  if (isLoading) {
    return <Layout><Card><LoadingState label="Memuat detail perlombaan…" /></Card></Layout>;
  }
  if (error || !competition) {
    return (
      <Layout>
        <Card>
          <ErrorState message={error || 'Perlombaan tidak ditemukan.'} onRetry={loadAll} />
          <div className="text-center mt-4">
            <Button variant="secondary" onClick={() => navigate('/competitions')}>Kembali</Button>
          </div>
        </Card>
      </Layout>
    );
  }

  const registeredCount = participants.length;
  const checkedInCount = participants.filter((cp) => cp.participant?.status === 'CHECKED_IN').length;
  const scoredCount = scores.length;
  const completedCount = participants.filter((cp) => cp.status === 'COMPLETED').length;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <button className="btn-link" onClick={() => navigate('/competitions')}>← Kembali</button>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">{competition.title}</h1>
          <div className="flex gap-2 flex-wrap">
            <CompetitionTypeBadge type={competition.type} />
            <CompetitionStatusBadge status={competition.status} />
          </div>
        </div>
        {canManage && competition.status !== 'FINISHED' && competition.status !== 'CANCELLED' && (
          <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
            {competition.status !== 'RUNNING' ? (
              <Button size="sm" variant="success" onClick={() => changeStatus(api.startCompetition, 'Perlombaan dimulai.')}>Mulai</Button>
            ) : (
              <Button size="sm" variant="success" onClick={() => changeStatus(api.finishCompetition, 'Perlombaan selesai.')}>Selesai</Button>
            )}
            <Button size="sm" variant="warning" onClick={() => changeStatus(api.cancelCompetition, 'Perlombaan dibatalkan.')}>Batal</Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((t) => (
          <button key={t.key} className={`admin-tab ${tab === t.key ? 'is-active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {competition.description && <Card><p className="text-gray-600">{competition.description}</p></Card>}
          <Card>
            <h3 className="font-bold text-navy-900 mb-4">Statistik</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="stat-mini"><span className="stat-mini-value">{registeredCount}</span><span className="stat-mini-label">Peserta Terdaftar</span></div>
              <div className="stat-mini"><span className="stat-mini-value">{checkedInCount}</span><span className="stat-mini-label">Check-in</span></div>
              <div className="stat-mini"><span className="stat-mini-value">{teams.length}</span><span className="stat-mini-label">Tim</span></div>
              <div className="stat-mini"><span className="stat-mini-value">{scoredCount}</span><span className="stat-mini-label">Skor Tercatat</span></div>
              <div className="stat-mini"><span className="stat-mini-value">{completedCount}</span><span className="stat-mini-label">Selesai</span></div>
            </div>
          </Card>
          <Card>
            <h3 className="font-bold text-navy-900 mb-4">Jadwal</h3>
            <div className="detail-row"><span className="detail-label">Waktu Mulai</span><span className="detail-value">{competition.startTime || '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Waktu Selesai</span><span className="detail-value">{competition.endTime || '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Metode Scoring</span><span className="detail-value">{competition.scoringMethod}</span></div>
            <div className="detail-row"><span className="detail-label">Maks. Peserta</span><span className="detail-value">{competition.maxParticipants}</span></div>
            <div className="detail-row"><span className="detail-label">Maks. Anggota Tim</span><span className="detail-value">{competition.maxGroupSize}</span></div>
          </Card>
        </div>
      )}

      {tab === 'participants' && (
        <Card><CompetitionParticipants competition={competition} canManage={canManage} /></Card>
      )}

      {tab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {canManage && competition.type !== 'INDIVIDUAL' && (
              <Button onClick={() => { setEditingTeam(null); setTeamFormOpen(true); }}>+ Tambah Tim</Button>
            )}
          </div>
          <Card className="p-0">
            <TeamTable
              teams={teams}
              onView={setTeamDetail}
              onEdit={(t) => { setEditingTeam(t); setTeamFormOpen(true); }}
              onDelete={handleDeleteTeam}
              onDisqualify={handleDisqualifyTeam}
              canManage={canManage}
            />
          </Card>
        </div>
      )}

      {tab === 'scoring' && (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={loadHistory}>Riwayat Skor</Button>
            {canManage && competition.status === 'RUNNING' && (
              <Button onClick={() => { setEditingScore(null); setScoreFormOpen(true); }}>+ Tambah Skor</Button>
            )}
          </div>
          <Card className="p-0">
            <ScoreTable scores={scores} onEdit={(s) => { setEditingScore(s); setScoreFormOpen(true); }} canManage={canManage} />
          </Card>
          {history.length > 0 && (
            <Card>
              <h3 className="font-bold text-navy-900 mb-4">Riwayat Skor</h3>
              <ScoreHistory history={history} />
            </Card>
          )}
        </div>
      )}

      {tab === 'ranking' && (
        <Card className="p-0">
          <LeaderboardTable entries={leaderboard} />
        </Card>
      )}

      {tab === 'nominations' && (
        <Card className="p-0">
          <NominationTable
            nominations={nominations}
            onConfirm={handleConfirmNomination}
            onReject={handleRejectNomination}
            canManage={canNominate}
          />
        </Card>
      )}

      <TeamForm
        open={teamFormOpen}
        onClose={() => { setTeamFormOpen(false); setEditingTeam(null); }}
        onSubmit={handleTeamSubmit}
        editingTeam={editingTeam}
      />
      <TeamDetail
        team={teamDetail}
        competition={competition}
        canManage={canManage}
        onClose={() => setTeamDetail(null)}
        onChanged={loadAll}
      />
      <ScoreForm
        open={scoreFormOpen}
        onClose={() => { setScoreFormOpen(false); setEditingScore(null); }}
        onSubmit={handleScoreSubmit}
        competition={competition}
        participants={participants}
        teams={teams}
        editingScore={editingScore}
      />
    </Layout>
  );
}

export default CompetitionDetailPage;
