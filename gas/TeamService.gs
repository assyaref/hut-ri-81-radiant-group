/**
 * Team service.
 * Teams sheet: ID, COMPETITION_ID, NAME, DEPARTMENT, CAPTAIN_PARTICIPANT_ID, STATUS, CREATED_AT, UPDATED_AT
 * Members sheet: ID, TEAM_ID, PARTICIPANT_ID, JOINED_AT
 */
const TeamService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.TEAMS, Config.TEAM_HEADERS),

  getMemberSheet: () => Utils.ensureSheet(Config.SHEETS.TEAM_MEMBERS, Config.TEAM_MEMBER_HEADERS),

  toTeam: (row) => ({
    id: row.id,
    competitionId: row.competition_id,
    name: row.name,
    department: row.department || '',
    captainParticipantId: row.captain_participant_id || '',
    status: row.status || 'ACTIVE',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  }),

  toMember: (row) => ({
    id: row.id,
    teamId: row.team_id,
    participantId: row.participant_id,
    joinedAt: row.joined_at || '',
  }),

  getMembers: (teamId) => {
    const rows = Utils.readRows(TeamService.getMemberSheet());
    return rows
      .filter((row) => String(row.team_id) === String(teamId))
      .map((row) => {
        const member = TeamService.toMember(row);
        const participant = ParticipantService.getParticipantById(member.participantId);
        return { ...member, participant };
      });
  },

  getAllTeams: (competitionId) => {
    const rows = Utils.readRows(TeamService.getSheet());
    return rows
      .filter((row) => !competitionId || String(row.competition_id) === String(competitionId))
      .map((row) => {
        const team = TeamService.toTeam(row);
        const members = TeamService.getMembers(team.id);
        return { ...team, members, memberCount: members.length };
      });
  },

  getTeam: (id) => {
    const rows = Utils.readRows(TeamService.getSheet());
    const found = Utils.findRow(rows, 'id', id);
    if (!found) return null;
    const team = TeamService.toTeam(found);
    const members = TeamService.getMembers(id);
    return { ...team, members, memberCount: members.length };
  },

  getMemberParticipantIds: (competitionId) => {
    const teams = TeamService.getAllTeams(competitionId);
    const ids = [];
    teams.forEach((t) => (t.members || []).forEach((m) => ids.push(String(m.participantId))));
    return ids;
  },

  isMember: (teamId, participantId) => {
    const members = TeamService.getMembers(teamId);
    return members.some((m) => String(m.participantId) === String(participantId));
  },

  createTeam: (competitionId, name, department, captainParticipantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const competition = CompetitionService.getCompetition(competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (competition.type === 'INDIVIDUAL') return { success: false, message: 'Perlombaan individu tidak memiliki tim' };
      const cleanName = Utils.sanitize(name);
      if (!cleanName) return { success: false, message: 'Nama tim wajib diisi' };
      const now = Utils.getCurrentTimestamp();
      const row = {
        id: Utils.generateId(),
        competition_id: competitionId,
        name: cleanName,
        department: Utils.sanitize(department || ''),
        captain_participant_id: captainParticipantId || '',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      };
      Utils.appendRow(TeamService.getSheet(), Config.TEAM_HEADERS, row);
      return { success: true, data: TeamService.toTeam(row) };
    } finally {
      lock.releaseLock();
    }
  },

  updateTeam: (id, data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = TeamService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Tim tidak ditemukan' };
      if (data.name !== undefined) Utils.writeCell(sheet, found.rowIndex, 2, Utils.sanitize(data.name));
      if (data.department !== undefined) Utils.writeCell(sheet, found.rowIndex, 3, Utils.sanitize(data.department));
      Utils.writeCell(sheet, found.rowIndex, 7, Utils.getCurrentTimestamp());
      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: TeamService.toTeam(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  deleteTeam: (id) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = TeamService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Tim tidak ditemukan' };
      sheet.deleteRow(found.rowIndex);

      const memberSheet = TeamService.getMemberSheet();
      const memberRows = Utils.readRows(memberSheet).filter((r) => String(r.team_id) === String(id));
      memberRows.sort((a, b) => b.rowIndex - a.rowIndex);
      memberRows.forEach((r) => memberSheet.deleteRow(r.rowIndex));
      return { success: true, message: 'Tim dihapus' };
    } finally {
      lock.releaseLock();
    }
  },

  addMember: (teamId, participantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const team = TeamService.getTeam(teamId);
      if (!team) return { success: false, message: 'Tim tidak ditemukan' };
      if (team.status !== 'ACTIVE') return { success: false, message: 'Tim tidak aktif' };
      const competition = CompetitionService.getCompetition(team.competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (competition.status === 'FINISHED' || competition.status === 'CANCELLED') {
        return { success: false, message: 'Perlombaan tidak dapat menerima anggota' };
      }
      const participant = ParticipantService.getParticipantById(participantId);
      if (!participant) return { success: false, message: 'Peserta tidak ditemukan' };
      if (participant.status !== 'CHECKED_IN') {
        return { success: false, message: 'Peserta harus check-in terlebih dahulu' };
      }
      if (TeamService.isMember(teamId, participantId)) {
        return { success: false, message: 'Peserta sudah menjadi anggota tim ini' };
      }
      const allMemberIds = TeamService.getMemberParticipantIds(competition.id);
      if (allMemberIds.indexOf(String(participantId)) !== -1) {
        return { success: false, message: 'Peserta sudah berada di tim lain untuk perlombaan ini' };
      }
      if ((team.members || []).length >= competition.maxGroupSize) {
        return { success: false, message: 'Tim sudah mencapai jumlah anggota maksimal' };
      }

      const row = {
        id: Utils.generateId(),
        team_id: teamId,
        participant_id: participantId,
        joined_at: Utils.getCurrentTimestamp(),
      };
      Utils.appendRow(TeamService.getMemberSheet(), Config.TEAM_MEMBER_HEADERS, row);
      return { success: true, data: { ...TeamService.toMember(row), participant } };
    } finally {
      lock.releaseLock();
    }
  },

  removeMember: (teamId, participantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const memberSheet = TeamService.getMemberSheet();
      const rows = Utils.readRows(memberSheet);
      const found = rows.find(
        (r) => String(r.team_id) === String(teamId) && String(r.participant_id) === String(participantId)
      );
      if (!found) return { success: false, message: 'Anggota tidak ditemukan' };
      memberSheet.deleteRow(found.rowIndex);

      const teamSheet = TeamService.getSheet();
      const teamRows = Utils.readRows(teamSheet);
      const team = Utils.findRow(teamRows, 'id', teamId);
      if (team && String(team.captain_participant_id) === String(participantId)) {
        Utils.writeCell(teamSheet, team.rowIndex, 4, '');
      }
      return { success: true, message: 'Anggota dihapus' };
    } finally {
      lock.releaseLock();
    }
  },

  setCaptain: (teamId, participantId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      if (!TeamService.isMember(teamId, participantId)) {
        return { success: false, message: 'Kapten harus merupakan anggota tim' };
      }
      const teamSheet = TeamService.getSheet();
      const teamRows = Utils.readRows(teamSheet);
      const team = Utils.findRow(teamRows, 'id', teamId);
      if (!team) return { success: false, message: 'Tim tidak ditemukan' };
      Utils.writeCell(teamSheet, team.rowIndex, 4, participantId);
      const fresh = Utils.findRow(Utils.readRows(teamSheet), 'id', teamId);
      return { success: true, data: TeamService.toTeam(fresh) };
    } finally {
      lock.releaseLock();
    }
  },

  disqualifyTeam: (id) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const teamSheet = TeamService.getSheet();
      const teamRows = Utils.readRows(teamSheet);
      const team = Utils.findRow(teamRows, 'id', id);
      if (!team) return { success: false, message: 'Tim tidak ditemukan' };
      Utils.writeCell(teamSheet, team.rowIndex, 5, 'DISQUALIFIED');
      Utils.writeCell(teamSheet, team.rowIndex, 7, Utils.getCurrentTimestamp());
      const fresh = Utils.findRow(Utils.readRows(teamSheet), 'id', id);
      return { success: true, data: TeamService.toTeam(fresh) };
    } finally {
      lock.releaseLock();
    }
  },
};
