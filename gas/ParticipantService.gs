/**
 * Participant service for database operations
 * Sheet columns: ID, NAME, DEPARTMENT, UNIQUE_CODE, STATUS, REGISTERED_AT, CHECKED_IN_AT
 */
const ParticipantService = {
  getSheet: () => {
    return Utils.ensureSheet(Config.SHEETS.PARTICIPANTS, Config.PARTICIPANT_HEADERS);
  },

  /**
   * Map a raw sheet row (lowercased header keys) to a participant object.
   */
  toParticipant: (row) => {
    return {
      id: row.id,
      name: row.name,
      department: row.department,
      uniqueCode: row.unique_code,
      status: row.status || 'REGISTERED',
      registeredAt: row.registered_at,
      checkedInAt: row.checked_in_at || '',
    };
  },

  getAllParticipants: () => {
    const rows = Utils.readRows(ParticipantService.getSheet());
    return rows.map((row) => ParticipantService.toParticipant(row));
  },

  getParticipantByCode: (code) => {
    const rows = Utils.readRows(ParticipantService.getSheet());
    const found = Utils.findRow(rows, 'unique_code', code);
    return found ? ParticipantService.toParticipant(found) : null;
  },

  getParticipantById: (id) => {
    const rows = Utils.readRows(ParticipantService.getSheet());
    const found = Utils.findRow(rows, 'id', id);
    return found ? ParticipantService.toParticipant(found) : null;
  },

  createParticipant: (name, department) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = ParticipantService.getSheet();
      const existingRows = Utils.readRows(sheet);

      // Ensure unique code is genuinely unique while holding the lock.
      let code;
      let attempts = 0;
      const maxAttempts = 20;
      do {
        code = Utils.generateUniqueCode();
        attempts++;
      } while (
        Utils.findRow(existingRows, 'unique_code', code) !== null &&
        attempts < maxAttempts
      );
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate a unique code');
      }

      const now = Utils.getCurrentTimestamp();
      const participant = {
        id: Utils.generateId(),
        name,
        department,
        unique_code: code,
        status: 'REGISTERED',
        registered_at: now,
        checked_in_at: '',
      };
      Utils.appendRow(sheet, Config.PARTICIPANT_HEADERS, participant);
      return ParticipantService.toParticipant(participant);
    } finally {
      lock.releaseLock();
    }
  },

  updateCheckinStatus: (code) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = ParticipantService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'unique_code', code);

      if (!found) {
        return { success: false, message: 'Participant not found', data: null };
      }
      if (found.status === 'CHECKED_IN') {
        return { success: false, message: 'Participant already checked in', data: null };
      }

      const now = Utils.getCurrentTimestamp();
      // STATUS is column index 4, CHECKED_IN_AT is column index 6 (0-based)
      Utils.writeCell(sheet, found.rowIndex, 4, 'CHECKED_IN');
      Utils.writeCell(sheet, found.rowIndex, 6, now);

      const updated = {
        id: found.id,
        name: found.name,
        department: found.department,
        unique_code: found.unique_code,
        status: 'CHECKED_IN',
        registered_at: found.registered_at,
        checked_in_at: now,
        rowIndex: found.rowIndex,
      };
      return { success: true, message: 'Check-in successful', data: updated };
    } finally {
      lock.releaseLock();
    }
  },

  searchParticipants: (query, department, status) => {
    const participants = ParticipantService.getAllParticipants();
    const q = (query || '').toLowerCase().trim();
    const dept = (department || '').toLowerCase().trim();

    return participants.filter((p) => {
      const matchesQuery =
        !q ||
        String(p.name).toLowerCase().includes(q) ||
        String(p.uniqueCode).toLowerCase().includes(q);
      const matchesDept = !dept || String(p.department).toLowerCase().includes(dept);
      const matchesStatus = !status || p.status === status;
      return matchesQuery && matchesDept && matchesStatus;
    });
  },

  getEligibleParticipants: () => {
    const all = ParticipantService.getAllParticipants();
    const winners = WinnerService.getWinnerParticipantIds();
    return all.filter(
      (p) => p.status === 'CHECKED_IN' && winners.indexOf(String(p.id)) === -1
    );
  },

  getStatistics: () => {
    const participants = ParticipantService.getAllParticipants();
    const total = participants.length;
    const checkedIn = participants.filter((p) => p.status === 'CHECKED_IN').length;
    return {
      totalParticipants: total,
      checkedIn,
      pending: total - checkedIn,
    };
  },
};