/**
 * Winner service for database operations
 * Sheet columns: ID, PARTICIPANT_ID, PARTICIPANT_NAME, DEPARTMENT, UNIQUE_CODE, PRIZE_ID, PRIZE_NAME, WON_AT, STATUS
 */
const WinnerService = {
  getSheet: () => {
    return Utils.ensureSheet(Config.SHEETS.WINNERS, Config.WINNER_HEADERS);
  },

  toWinner: (row) => {
    return {
      id: row.id,
      participantId: row.participant_id,
      participantName: row.participant_name,
      department: row.department,
      uniqueCode: row.unique_code,
      prizeId: row.prize_id,
      prizeName: row.prize_name,
      wonAt: row.won_at,
      status: row.status || 'AWARDED',
    };
  },

  getAllWinners: () => {
    const rows = Utils.readRows(WinnerService.getSheet());
    return rows.map((row) => WinnerService.toWinner(row)).reverse();
  },

  getWinnerById: (id) => {
    const rows = Utils.readRows(WinnerService.getSheet());
    const found = Utils.findRow(rows, 'id', id);
    return found ? WinnerService.toWinner(found) : null;
  },

  getWinnerParticipantIds: () => {
    const rows = Utils.readRows(WinnerService.getSheet());
    return rows.map((row) => String(row.participant_id));
  },

  hasParticipantWon: (participantId) => {
    const rows = Utils.readRows(WinnerService.getSheet());
    return Utils.findRow(rows, 'participant_id', participantId) !== null;
  },

  /**
   * Atomically create a winner and decrement prize availability.
   * Validates: prize exists, prize has stock, participant exists, participant has not won.
   */
  saveWinner: (participantId, prizeId) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const participant = ParticipantService.getParticipantById(participantId);
      if (!participant) {
        return { success: false, message: 'Participant not found' };
      }
      if (participant.status !== 'CHECKED_IN') {
        return { success: false, message: 'Participant has not checked in' };
      }
      if (WinnerService.hasParticipantWon(participantId)) {
        return { success: false, message: 'Participant has already won a prize' };
      }

      const prize = PrizeService.getPrizeById(prizeId);
      if (!prize) {
        return { success: false, message: 'Prize not found' };
      }
      if (prize.available <= 0) {
        return { success: false, message: 'Prize is no longer available' };
      }

      const decrement = PrizeService.decrementAvailable(prizeId);
      if (!decrement.success) {
        return { success: false, message: decrement.message };
      }

      const sheet = WinnerService.getSheet();
      const data = {
        id: Utils.generateId(),
        participant_id: participant.id,
        participant_name: participant.name,
        department: participant.department,
        unique_code: participant.uniqueCode,
        prize_id: prize.id,
        prize_name: prize.name,
        won_at: Utils.getCurrentTimestamp(),
        status: 'AWARDED',
      };
      Utils.appendRow(sheet, Config.WINNER_HEADERS, data);

      return {
        success: true,
        message: 'Winner saved',
        data: WinnerService.toWinner(data),
      };
    } finally {
      lock.releaseLock();
    }
  },

  statistics: () => {
    const winners = WinnerService.getAllWinners();
    return { totalWinners: winners.length, recentWinners: winners.slice(0, 10) };
  },
};