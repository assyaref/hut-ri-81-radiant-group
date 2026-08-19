/**
 * Competition service.
 * Sheet columns: ID, TITLE, TYPE, DESCRIPTION, STATUS, MAX_PARTICIPANTS, MAX_GROUP_SIZE,
 *                SCORING_METHOD, START_TIME, END_TIME, CREATED_AT, UPDATED_AT
 */
const CompetitionService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.COMPETITIONS, Config.COMPETITION_HEADERS),

  getParticipantSheet: () => Utils.ensureSheet(Config.SHEETS.COMPETITION_PARTICIPANTS, Config.COMPETITION_PARTICIPANT_HEADERS),

  toCompetition: (row) => ({
    id: row.id,
    title: row.title,
    type: row.type || 'INDIVIDUAL',
    description: row.description || '',
    status: row.status || 'DRAFT',
    maxParticipants: Number(row.max_participants) || 0,
    maxGroupSize: Number(row.max_group_size) || 1,
    scoringMethod: row.scoring_method || 'SCORE',
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  }),

  getAllCompetitions: () => {
    const rows = Utils.readRows(CompetitionService.getSheet());
    const competitions = rows.map((row) => CompetitionService.toCompetition(row));
    const cpRows = Utils.readRows(CompetitionService.getParticipantSheet());
    const teamRows = Utils.readRows(TeamService.getSheet());
    return competitions.map((c) => {
      const participantCount = cpRows.filter((r) => String(r.competition_id) === String(c.id)).length;
      const teamCount = teamRows.filter((r) => String(r.competition_id) === String(c.id)).length;
      return { ...c, participantCount, teamCount };
    });
  },

  getCompetition: (id) => {
    const rows = Utils.readRows(CompetitionService.getSheet());
    const found = Utils.findRow(rows, 'id', id);
    if (!found) return null;
    const competition = CompetitionService.toCompetition(found);
    const cpRows = Utils.readRows(CompetitionService.getParticipantSheet());
    const teamRows = Utils.readRows(TeamService.getSheet());
    competition.participantCount = cpRows.filter((r) => String(r.competition_id) === String(id)).length;
    competition.teamCount = teamRows.filter((r) => String(r.competition_id) === String(id)).length;
    return competition;
  },

  validType: (type) => ['INDIVIDUAL', 'GROUP', 'BOTH'].indexOf(type) !== -1,
  validMethod: (method) => ['SCORE', 'RANK', 'TIME'].indexOf(method) !== -1,

  createCompetition: (data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const title = Utils.sanitize(data.title);
      if (!title) return { success: false, message: 'Judul perlombaan wajib diisi' };
      const type = CompetitionService.validType(data.type) ? data.type : 'INDIVIDUAL';
      const method = CompetitionService.validMethod(data.scoringMethod) ? data.scoringMethod : 'SCORE';
      const now = Utils.getCurrentTimestamp();
      const row = {
        id: Utils.generateId(),
        title,
        type,
        description: Utils.sanitize(data.description || ''),
        status: 'DRAFT',
        max_participants: Math.max(1, Number(data.maxParticipants) || 100),
        max_group_size: Math.max(1, Number(data.maxGroupSize) || 5),
        scoring_method: method,
        start_time: Utils.sanitize(data.startTime || ''),
        end_time: Utils.sanitize(data.endTime || ''),
        created_at: now,
        updated_at: now,
      };
      Utils.appendRow(CompetitionService.getSheet(), Config.COMPETITION_HEADERS, row);
      return { success: true, data: CompetitionService.toCompetition(row) };
    } finally {
      lock.releaseLock();
    }
  },

  updateCompetition: (id, data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = CompetitionService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Perlombaan tidak ditemukan' };

      if (data.title !== undefined) Utils.writeCell(sheet, found.rowIndex, 1, Utils.sanitize(data.title));
      if (data.type !== undefined && CompetitionService.validType(data.type)) Utils.writeCell(sheet, found.rowIndex, 2, data.type);
      if (data.description !== undefined) Utils.writeCell(sheet, found.rowIndex, 3, Utils.sanitize(data.description));
      if (data.maxParticipants !== undefined) Utils.writeCell(sheet, found.rowIndex, 5, Math.max(1, Number(data.maxParticipants) || 1));
      if (data.maxGroupSize !== undefined) Utils.writeCell(sheet, found.rowIndex, 6, Math.max(1, Number(data.maxGroupSize) || 1));
      if (data.scoringMethod !== undefined && CompetitionService.validMethod(data.scoringMethod)) Utils.writeCell(sheet, found.rowIndex, 7, data.scoringMethod);
      if (data.startTime !== undefined) Utils.writeCell(sheet, found.rowIndex, 8, Utils.sanitize(data.startTime));
      if (data.endTime !== undefined) Utils.writeCell(sheet, found.rowIndex, 9, Utils.sanitize(data.endTime));
      Utils.writeCell(sheet, found.rowIndex, 11, Utils.getCurrentTimestamp());

      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: CompetitionService.toCompetition(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  deleteCompetition: (id) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = CompetitionService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (found.status === 'RUNNING' || found.status === 'FINISHED') {
        return { success: false, message: 'Perlombaan yang berjalan/selesai tidak dapat dihapus' };
      }
      sheet.deleteRow(found.rowIndex);
      return { success: true, message: 'Perlombaan dihapus' };
    } finally {
      lock.releaseLock();
    }
  },

  setStatus: (id, newStatus) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = CompetitionService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Perlombaan tidak ditemukan' };
      Utils.writeCell(sheet, found.rowIndex, 4, newStatus);
      Utils.writeCell(sheet, found.rowIndex, 11, Utils.getCurrentTimestamp());
      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: CompetitionService.toCompetition(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  startCompetition: (id) => {
    const comp = CompetitionService.getCompetition(id);
    if (!comp) return { success: false, message: 'Perlombaan tidak ditemukan' };
    if (comp.status === 'RUNNING') return { success: false, message: 'Perlombaan sudah berjalan' };
    if (comp.status === 'FINISHED') return { success: false, message: 'Perlombaan sudah selesai' };
    if (comp.status === 'CANCELLED') return { success: false, message: 'Perlombaan sudah dibatalkan' };
    return CompetitionService.setStatus(id, 'RUNNING');
  },

  finishCompetition: (id) => {
    const comp = CompetitionService.getCompetition(id);
    if (!comp) return { success: false, message: 'Perlombaan tidak ditemukan' };
    if (comp.status !== 'RUNNING') return { success: false, message: 'Hanya perlombaan berjalan yang bisa diselesaikan' };
    return CompetitionService.setStatus(id, 'FINISHED');
  },

  cancelCompetition: (id) => {
    const comp = CompetitionService.getCompetition(id);
    if (!comp) return { success: false, message: 'Perlombaan tidak ditemukan' };
    if (comp.status === 'FINISHED') return { success: false, message: 'Perlombaan selesai tidak dapat dibatalkan' };
    return CompetitionService.setStatus(id, 'CANCELLED');
  },

  ensureDefaults: () => {
    const sheet = CompetitionService.getSheet();
    if (sheet.getLastRow() > 1) return;
    const now = Utils.getCurrentTimestamp();
    Config.DEFAULT_COMPETITIONS.forEach((c) => {
      const row = {
        id: Utils.generateId(),
        title: c.title,
        type: c.type,
        description: c.description || '',
        status: 'DRAFT',
        max_participants: c.max_participants || 100,
        max_group_size: c.max_group_size || 5,
        scoring_method: c.scoring_method || 'SCORE',
        start_time: '',
        end_time: '',
        created_at: now,
        updated_at: now,
      };
      Utils.appendRow(sheet, Config.COMPETITION_HEADERS, row);
    });
  },
};
