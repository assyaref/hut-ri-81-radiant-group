/**
 * Competition winner service (performance-based winners).
 * Sheet columns: ID, COMPETITION_ID, PARTICIPANT_ID, TEAM_ID, POSITION, CATEGORY, SCORE,
 *                CONFIRMED_BY, CONFIRMED_AT
 */
const CompetitionWinnerService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.COMPETITION_WINNERS, Config.COMPETITION_WINNER_HEADERS),

  enrich: (winner) => {
    const result = { ...winner };
    const competition = CompetitionService.getCompetition(winner.competitionId);
    if (competition) result.competitionName = competition.title;
    if (winner.participantId) {
      const p = ParticipantService.getParticipantById(winner.participantId);
      if (p) { result.participantName = p.name; result.department = p.department; }
    } else if (winner.teamId) {
      const t = TeamService.getTeam(winner.teamId);
      if (t) { result.teamName = t.name; result.department = t.department; }
    }
    return result;
  },

  toWinner: (row) => CompetitionWinnerService.enrich({
    id: row.id,
    competitionId: row.competition_id,
    participantId: row.participant_id ? row.participant_id : null,
    teamId: row.team_id ? row.team_id : null,
    position: Number(row.position) || 0,
    category: row.category || '',
    score: row.score === '' ? null : Number(row.score),
    confirmedBy: row.confirmed_by || '',
    confirmedAt: row.confirmed_at || '',
  }),

  getWinners: (competitionId) => {
    const rows = Utils.readRows(CompetitionWinnerService.getSheet());
    return rows
      .filter((row) => !competitionId || String(row.competition_id) === String(competitionId))
      .map((row) => CompetitionWinnerService.toWinner(row))
      .sort((a, b) => a.position - b.position);
  },

  confirmWinner: (competitionId, participantId, teamId, position, category, score, confirmedBy) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const competition = CompetitionService.getCompetition(competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };

      const pos = Number(position);
      if (pos < 1 || pos > 3) return { success: false, message: 'Posisi harus 1, 2, atau 3' };

      const pId = participantId || null;
      const tId = teamId || null;
      if (!pId && !tId) return { success: false, message: 'Pilih peserta atau tim' };

      if (pId) {
        const p = ParticipantService.getParticipantById(pId);
        if (!p) return { success: false, message: 'Peserta tidak ditemukan' };
      }
      if (tId) {
        const t = TeamService.getTeam(tId);
        if (!t) return { success: false, message: 'Tim tidak ditemukan' };
        if (String(t.competitionId) !== String(competition.id)) return { success: false, message: 'Tim tidak termasuk perlombaan ini' };
      }

      const existing = CompetitionWinnerService.getWinners(competitionId);
      const dupPosition = existing.find((w) => w.position === pos);
      if (dupPosition) return { success: false, message: 'Posisi ' + pos + ' sudah terisi' };

      const dupWinner = existing.find(
        (w) => (pId && String(w.participantId) === String(pId)) || (tId && String(w.teamId) === String(tId))
      );
      if (dupWinner) return { success: false, message: 'Peserta/tim ini sudah menjadi pemenang' };

      const now = Utils.getCurrentTimestamp();
      const row = {
        id: Utils.generateId(),
        competition_id: competitionId,
        participant_id: pId || '',
        team_id: tId || '',
        position: pos,
        category: Utils.sanitize(category || ''),
        score: score == null ? '' : score,
        confirmed_by: Utils.sanitize(confirmedBy || ''),
        confirmed_at: now,
      };
      Utils.appendRow(CompetitionWinnerService.getSheet(), Config.COMPETITION_WINNER_HEADERS, row);
      return { success: true, data: CompetitionWinnerService.toWinner(row) };
    } finally {
      lock.releaseLock();
    }
  },
};
