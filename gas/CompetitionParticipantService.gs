/**
 * Competition participant service.
 * Sheet columns: ID, COMPETITION_ID, PARTICIPANT_ID, STATUS, REGISTERED_AT
 */
const CompetitionParticipantService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.COMPETITION_PARTICIPANTS, Config.COMPETITION_PARTICIPANT_HEADERS),

  toEntry: (row) => ({
    id: row.id,
    competitionId: row.competition_id,
    participantId: row.participant_id,
    status: row.status || 'REGISTERED',
    registeredAt: row.registered_at || '',
  }),

  getAll: () => {
    const rows = Utils.readRows(CompetitionParticipantService.getSheet());
    return rows.map((row) => CompetitionParticipantService.toEntry(row));
  },

  getByCompetition: (competitionId) => {
    const rows = Utils.readRows(CompetitionParticipantService.getSheet());
    return rows
      .filter((row) => String(row.competition_id) === String(competitionId))
      .map((row) => {
        const entry = CompetitionParticipantService.toEntry(row);
        const participant = ParticipantService.getParticipantById(entry.participantId);
        return { ...entry, participant };
      });
  },

  isRegistered: (competitionId, participantId) => {
    const rows = Utils.readRows(CompetitionParticipantService.getSheet());
    return Utils.findRow(rows.filter((r) => String(r.competition_id) === String(competitionId)), 'participant_id', participantId) !== null;
  },

  addParticipant: (competitionId, participantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const competition = CompetitionService.getCompetition(competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (competition.status === 'FINISHED' || competition.status === 'CANCELLED') {
        return { success: false, message: 'Perlombaan tidak dapat menerima peserta' };
      }
      const participant = ParticipantService.getParticipantById(participantId);
      if (!participant) return { success: false, message: 'Peserta tidak ditemukan' };
      if (participant.status !== 'CHECKED_IN') {
        return { success: false, message: 'Peserta harus check-in terlebih dahulu' };
      }
      if (CompetitionParticipantService.isRegistered(competitionId, participantId)) {
        return { success: false, message: 'Peserta sudah terdaftar di perlombaan ini' };
      }
      const existing = CompetitionParticipantService.getByCompetition(competitionId);
      if (existing.length >= competition.maxParticipants) {
        return { success: false, message: 'Kuota peserta perlombaan sudah penuh' };
      }

      const row = {
        id: Utils.generateId(),
        competition_id: competitionId,
        participant_id: participantId,
        status: 'REGISTERED',
        registered_at: Utils.getCurrentTimestamp(),
      };
      Utils.appendRow(CompetitionParticipantService.getSheet(), Config.COMPETITION_PARTICIPANT_HEADERS, row);
      return { success: true, data: { ...CompetitionParticipantService.toEntry(row), participant } };
    } finally {
      lock.releaseLock();
    }
  },

  removeParticipant: (competitionId, participantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = CompetitionParticipantService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = rows.find(
        (r) => String(r.competition_id) === String(competitionId) && String(r.participant_id) === String(participantId)
      );
      if (!found) return { success: false, message: 'Peserta tidak terdaftar di perlombaan ini' };
      sheet.deleteRow(found.rowIndex);
      return { success: true, message: 'Peserta dihapus dari perlombaan' };
    } finally {
      lock.releaseLock();
    }
  },
};
