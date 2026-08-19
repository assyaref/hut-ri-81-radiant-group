/**
 * Scoring service.
 * Scores sheet: ID, COMPETITION_ID, PARTICIPANT_ID, TEAM_ID, METHOD, SCORE, TIME_MS, RANK, STATUS, CREATED_AT, UPDATED_AT
 * History sheet: ID, COMPETITION_ID, PARTICIPANT_ID, TEAM_ID, PREVIOUS_SCORE, NEW_SCORE, CHANGED_BY, REASON, CHANGED_AT
 */
const ScoringService = {
  getSheet: () => Utils.ensureSheet(Config.SHEETS.SCORES, Config.SCORE_HEADERS),

  getHistorySheet: () => Utils.ensureSheet(Config.SHEETS.SCORE_HISTORY, Config.SCORE_HISTORY_HEADERS),

  toScore: (row) => ({
    id: row.id,
    competitionId: row.competition_id,
    participantId: row.participant_id ? row.participant_id : null,
    teamId: row.team_id ? row.team_id : null,
    method: row.method || 'SCORE',
    score: row.score === '' || row.score == null ? null : Number(row.score),
    timeMs: row.time_ms === '' || row.time_ms == null ? null : Number(row.time_ms),
    rank: row.rank === '' || row.rank == null ? null : Number(row.rank),
    status: row.status || 'ACTIVE',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  }),

  toHistory: (row) => ({
    id: row.id,
    competitionId: row.competition_id,
    participantId: row.participant_id ? row.participant_id : null,
    teamId: row.team_id ? row.team_id : null,
    previousScore: row.previous_score === '' ? null : Number(row.previous_score),
    newScore: row.new_score === '' ? null : Number(row.new_score),
    changedBy: row.changed_by || '',
    reason: row.reason || '',
    changedAt: row.changed_at || '',
  }),

  convertRankToPoints: (rank) => {
    const idx = Number(rank) - 1;
    if (idx >= 0 && idx < Config.RANK_POINTS.length) return Config.RANK_POINTS[idx];
    // For ranks beyond the configured list, fall back to a descending value.
    return Math.max(1, 35 - (Number(rank) - 5) * 5);
  },

  enrich: (score) => {
    const result = { ...score };
    if (score.participantId) {
      const p = ParticipantService.getParticipantById(score.participantId);
      if (p) { result.participantName = p.name; result.department = p.department; }
    } else if (score.teamId) {
      const t = TeamService.getTeam(score.teamId);
      if (t) { result.teamName = t.name; result.department = t.department; }
    }
    return result;
  },

  getScores: (competitionId) => {
    const rows = Utils.readRows(ScoringService.getSheet());
    return rows
      .filter((row) => String(row.competition_id) === String(competitionId))
      .map((row) => ScoringService.enrich(ScoringService.toScore(row)));
  },

  getScoreHistory: (competitionId) => {
    const rows = Utils.readRows(ScoringService.getHistorySheet());
    return rows
      .filter((row) => String(row.competition_id) === String(competitionId))
      .map((row) => ScoringService.toHistory(row))
      .sort((a, b) => String(b.changedAt).localeCompare(String(a.changedAt)));
  },

  saveScore: (data) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const competition = CompetitionService.getCompetition(data.competitionId);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };
      if (competition.status !== 'RUNNING') return { success: false, message: 'Perlombaan harus berjalan untuk input skor' };

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

      const existing = ScoringService.getScores(competition.id);
      const dup = existing.find(
        (s) => (participantId && String(s.participantId) === String(participantId)) || (teamId && String(s.teamId) === String(teamId))
      );
      if (dup) return { success: false, message: 'Skor untuk peserta/tim ini sudah ada' };

      const method = competition.scoringMethod;
      let score = null;
      let timeMs = null;
      let rank = null;
      if (method === 'SCORE') {
        score = Number(data.score);
        if (score == null || isNaN(score) || score < 0) return { success: false, message: 'Skor tidak valid' };
      } else if (method === 'TIME') {
        timeMs = Number(data.timeMs);
        if (timeMs == null || isNaN(timeMs) || timeMs < 0) return { success: false, message: 'Waktu tidak valid' };
      } else if (method === 'RANK') {
        rank = Number(data.rank);
        if (rank == null || isNaN(rank) || rank < 1) return { success: false, message: 'Peringkat tidak valid' };
        score = ScoringService.convertRankToPoints(rank);
      }

      const now = Utils.getCurrentTimestamp();
      const row = {
        id: Utils.generateId(),
        competition_id: competition.id,
        participant_id: participantId || '',
        team_id: teamId || '',
        method,
        score: score == null ? '' : score,
        time_ms: timeMs == null ? '' : timeMs,
        rank: rank == null ? '' : rank,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      };
      Utils.appendRow(ScoringService.getSheet(), Config.SCORE_HEADERS, row);
      return { success: true, data: ScoringService.enrich(ScoringService.toScore(row)) };
    } finally {
      lock.releaseLock();
    }
  },

  updateScore: (id, data, reason) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = ScoringService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) return { success: false, message: 'Skor tidak ditemukan' };

      const competition = CompetitionService.getCompetition(found.competition_id);
      if (!competition) return { success: false, message: 'Perlombaan tidak ditemukan' };

      const method = competition.scoringMethod;
      let score = null;
      let timeMs = null;
      let rank = null;
      if (method === 'SCORE') {
        score = Number(data.score);
        if (score == null || isNaN(score) || score < 0) return { success: false, message: 'Skor tidak valid' };
      } else if (method === 'TIME') {
        timeMs = Number(data.timeMs);
        if (timeMs == null || isNaN(timeMs) || timeMs < 0) return { success: false, message: 'Waktu tidak valid' };
      } else if (method === 'RANK') {
        rank = Number(data.rank);
        if (rank == null || isNaN(rank) || rank < 1) return { success: false, message: 'Peringkat tidak valid' };
        score = ScoringService.convertRankToPoints(rank);
      }

      const old = ScoringService.toScore(found);
      let previousScore = null;
      let newScore = null;
      if (method === 'SCORE') { previousScore = old.score; newScore = score; }
      else if (method === 'TIME') { previousScore = old.timeMs; newScore = timeMs; }
      else { previousScore = old.rank; newScore = rank; }

      Utils.writeCell(sheet, found.rowIndex, 5, score == null ? '' : score);
      Utils.writeCell(sheet, found.rowIndex, 6, timeMs == null ? '' : timeMs);
      Utils.writeCell(sheet, found.rowIndex, 7, rank == null ? '' : rank);
      Utils.writeCell(sheet, found.rowIndex, 10, Utils.getCurrentTimestamp());

      const historyRow = {
        id: Utils.generateId(),
        competition_id: competition.id,
        participant_id: found.participant_id || '',
        team_id: found.team_id || '',
        previous_score: previousScore == null ? '' : previousScore,
        new_score: newScore == null ? '' : newScore,
        changed_by: Utils.sanitize(data.changedBy || ''),
        reason: Utils.sanitize(reason || ''),
        changed_at: Utils.getCurrentTimestamp(),
      };
      Utils.appendRow(ScoringService.getHistorySheet(), Config.SCORE_HISTORY_HEADERS, historyRow);

      const fresh = Utils.findRow(Utils.readRows(sheet), 'id', id);
      return { success: true, data: ScoringService.enrich(ScoringService.toScore(fresh)) };
    } finally {
      lock.releaseLock();
    }
  },

  computeLeaderboard: (competitionId) => {
    const competition = CompetitionService.getCompetition(competitionId);
    if (!competition) return [];
    const scores = ScoringService.getScores(competitionId);

    const entries = [];
    scores.forEach((s) => {
      let name = '';
      let department = '';
      let isTeam = false;
      if (s.participantId) {
        const p = ParticipantService.getParticipantById(s.participantId);
        name = p ? p.name : s.participantId;
        if (p) department = p.department;
      } else if (s.teamId) {
        const t = TeamService.getTeam(s.teamId);
        name = t ? t.name : s.teamId;
        if (t) department = t.department;
        isTeam = true;
      }
      let comparable = null;
      if (competition.scoringMethod === 'TIME') comparable = s.timeMs;
      else if (competition.scoringMethod === 'RANK') comparable = s.rank;
      else comparable = s.score;
      entries.push({ id: s.participantId || s.teamId, name, department, score: s.score, timeMs: s.timeMs, isTeam, comparable });
    });

    const method = competition.scoringMethod;
    entries.sort((a, b) => {
      const av = a.comparable == null ? (method === 'SCORE' ? -Infinity : Infinity) : a.comparable;
      const bv = b.comparable == null ? (method === 'SCORE' ? -Infinity : Infinity) : b.comparable;
      if (method === 'SCORE') return bv - av;
      return av - bv;
    });

    const result = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const prev = entries[i - 1];
      const next = entries[i + 1];
      const isTie = (prev && e.comparable != null && e.comparable === prev.comparable) || (next && e.comparable != null && e.comparable === next.comparable);
      const rank = i > 0 && prev && e.comparable != null && e.comparable === prev.comparable ? result[i - 1].rank : i + 1;
      result.push({
        rank,
        id: e.id,
        name: e.name,
        department: e.department,
        competitionId: competitionId,
        competitionName: competition.title,
        score: e.score,
        timeMs: e.timeMs,
        isTeam: e.isTeam,
        tie: !!isTie,
      });
    }
    return result;
  },

  getLeaderboard: (competitionId) => {
    let competitions = [];
    if (competitionId) {
      const c = CompetitionService.getCompetition(competitionId);
      if (c) competitions = [c];
    } else {
      competitions = CompetitionService.getAllCompetitions();
    }
    const result = [];
    competitions.forEach((c) => {
      const lb = ScoringService.computeLeaderboard(c.id);
      lb.forEach((entry) => result.push(entry));
    });
    return result;
  },
};
