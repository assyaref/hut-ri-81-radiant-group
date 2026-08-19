/**
 * Nomination service.
 * Sheet columns: ID, COMPETITION_ID, PARTICIPANT_ID, TEAM_ID, CATEGORY, POSITION, STATUS,
 *                CREATED_BY, CREATED_AT, CONFIRMED_BY, CONFIRMED_AT
 */
const NominationService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.NOMINATIONS, Config.NOMINATION_HEADERS),

  validCategory: (category) => ['JUARA_1', 'JUARA_2', 'JUARA_3', 'BEST_TEAM', 'BEST_YEL_YEL'].indexOf(category) !== -1,

  enrich: (nomination) => {
    const result = { ...nomination };
    const competition = CompetitionService.getCompetition(nomination.competitionId);
    if (competition) result.competitionName = competition.title;
    if (nomination.participantId) {
      const p = ParticipantService.getParticipantById(nomination.participantId);
      if (p) { result.participantName = p.name; result.department = p.department; }
    } else if (nomination.teamId) {
      const t = TeamService.getTeam(nomination.teamId);
      if (t) { result.teamName = t.name; result.department = t.department; }
    }
    return result;
  },

  toNomination: (row) => NominationService.enrich({
    id: row.id,
    competitionId: row.competition_id,
    participantId: row.participant_id ? row.participant_id : null,
    teamId: row.team_id ? row.team_id : null,
    category: row.category,
    position: Number(row.position) || 0,
    status: row.status || 'NOMINATED',
    createdBy: row.created_by || '',
    createdAt: row.created_at || '',
    confirmedBy: row.confirmed_by || null,
    confirmedAt: row.confirmed_at || null,
  }),

  getNominations: (competitionId) => {
    const rows = Utils.readRows(NominationService.getSheet());
    return rows
      .filter((row) => !competitionId || String(row.competition_id) === String(competitionId))
      .map((row) => NominationService.toNomination(row))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },

  createNomination: (data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const competition = CompetitionService.getCompetition(data.competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (!NominationService.validCategory(data.category)) return { success: false, message: 'Kategori tidak valid' };

      const participantId = data.participantId || null;
      const teamId = data.teamId || null;
      if (!participantId && !teamId) return { success: false, message: 'Pilih peserta atau tim' };

      if (participantId) {
        const p = ParticipantService.getParticipantById(participantId);
        if (!p) return { success: false, message: 'Peserta tidak ditemukan' };
        if (!CompetitionParticipantService.isRegistered(competition.id, participantId)) {
          return { success: false, message: 'Peserta tidak terdaftar di perlombaan ini' };
        }
      }
      if (teamId) {
        const t = TeamService.getTeam(teamId);
        if (!t) return { success: false, message: 'Tim tidak ditemukan' };
        if (String(t.competitionId) !== String(competition.id)) return { success: false, message: 'Tim tidak termasuk perlombaan ini' };
      }

      const existing = NominationService.getNominations(competition.id);
      const dup = existing.find(
        (n) => n.category === data.category && ((participantId && String(n.participantId) === String(participantId)) || (teamId && String(n.teamId) === String(teamId)))
      );
      if (dup) return { success: false, message: 'Nominasi sudah ada untuk kategori ini' };

      const now = Utils.getCurrentTimestamp();
      const row = {
        id: Utils.generateId(),
        competition_id: competition.id,
        participant_id: participantId || '',
        team_id: teamId || '',
        category: data.category,
        position: Number(data.position) || 0,
        status: 'NOMINATED',
        created_by: Utils.sanitize(data.createdBy || ''),
        created_at: now,
        confirmed_by: '',
        confirmed_at: '',
      };
      Utils.appendRow(NominationService.getSheet(), Config.NOMINATION_HEADERS, row);
      return { success: true, data: NominationService.toNomination(row) };
    } finally {
      lock.releaseLock();
    }
  },

  setStatus: (id, status, actorName) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = NominationService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Nominasi tidak ditemukan' };
      Utils.writeCell(sheet, found.rowIndex, 6, status);
      if (status === 'CONFIRMED') {
        Utils.writeCell(sheet, found.rowIndex, 9, Utils.sanitize(actorName || ''));
        Utils.writeCell(sheet, found.rowIndex, 10, Utils.getCurrentTimestamp());
      }
      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: NominationService.toNomination(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  updateNomination: (id, data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = NominationService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Nominasi tidak ditemukan' };
      if (data.category !== undefined && NominationService.validCategory(data.category)) Utils.writeCell(sheet, found.rowIndex, 4, data.category);
      if (data.position !== undefined) Utils.writeCell(sheet, found.rowIndex, 5, Number(data.position) || 0);
      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: NominationService.toNomination(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  confirmNomination: (id, actorName) => NominationService.setStatus(id, 'CONFIRMED', actorName),

  rejectNomination: (id) => NominationService.setStatus(id, 'REJECTED', ''),
};
