import { useCallback, useEffect, useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import TeamMemberList from './TeamMemberList';
import { LoadingState } from '../ui/Feedback';
import type { Competition, Participant, Team, TeamMember } from '../../types/hutRi';
import api from '../../services/api';

interface TeamDetailProps {
  team: Team | null;
  competition: Competition;
  canManage: boolean;
  onClose: () => void;
  onChanged: () => void;
}

function TeamDetail({ team, competition, canManage, onClose, onChanged }: TeamDetailProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [available, setAvailable] = useState<Participant[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!team) return;
    setIsLoading(true);
    setError('');
    try {
      const [teamRes, teamsRes, partsRes] = await Promise.all([
        api.getTeam(team.id),
        api.getTeams(competition.id),
        api.getParticipants(),
      ]);
      const full = teamRes.success ? teamRes.data : null;
      const membersArr = (full && full.members) || [];
      setMembers(membersArr);

      const teams = teamsRes.success ? (Array.isArray(teamsRes.data) ? teamsRes.data : []) : [];
      const inAnyTeam = new Set<string>();
      teams.forEach((t) => (t.members || []).forEach((m) => inAnyTeam.add(m.participantId)));

      const parts = partsRes.success ? (Array.isArray(partsRes.data) ? partsRes.data : []) : [];
      setAvailable(parts.filter((p) => p.status === 'CHECKED_IN' && !inAnyTeam.has(p.id)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat detail tim.');
    } finally {
      setIsLoading(false);
    }
  }, [team, competition.id]);

  useEffect(() => {
    if (team) load();
  }, [load, team]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = () => run(async () => {
    if (!team || !selectedId) return;
    const res = await api.addTeamMember(team.id, selectedId);
    if (!res.success) setError(res.message);
    else setSelectedId('');
  });

  const handleRemove = (participantId: string) => run(async () => {
    if (!team) return;
    const res = await api.removeTeamMember(team.id, participantId);
    if (!res.success) setError(res.message);
  });

  const handleSetCaptain = (participantId: string) => run(async () => {
    if (!team) return;
    const res = await api.setTeamCaptain(team.id, participantId);
    if (!res.success) setError(res.message);
  });

  const handleDisqualify = () => run(async () => {
    if (!team) return;
    const res = await api.disqualifyTeam(team.id);
    if (!res.success) setError(res.message);
  });

  return (
    <Modal open={!!team} title={team ? team.name : 'Detail Tim'} onClose={onClose}>
      {team && (
        <div className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <p className="text-gray-600">
            {team.department || 'Tanpa departemen'} · {members.length} / {competition.maxGroupSize} anggota
          </p>

          {canManage && team.status !== 'DISQUALIFIED' && (
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-grow">
                <label className="filter-label" htmlFor="tm-add">Tambah Anggota</label>
                <select
                  id="tm-add"
                  className="input-control"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Pilih peserta…</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.department}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={handleAdd} disabled={!selectedId || busy}>Tambah</Button>
            </div>
          )}

          {isLoading ? (
            <LoadingState label="Memuat anggota…" />
          ) : (
            <TeamMemberList
              members={members}
              captainParticipantId={team.captainParticipantId}
              canManage={canManage && team.status !== 'DISQUALIFIED'}
              onSetCaptain={handleSetCaptain}
              onRemove={handleRemove}
            />
          )}

          {canManage && team.status === 'ACTIVE' && (
            <div className="flex justify-end">
              <Button size="sm" variant="warning" onClick={handleDisqualify} disabled={busy}>
                Diskualifikasi Tim
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default TeamDetail;
