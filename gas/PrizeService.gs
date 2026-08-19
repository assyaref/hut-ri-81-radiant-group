/**
 * Prize service for database operations
 * Sheet columns: ID, NAME, DESCRIPTION, QUANTITY, AVAILABLE, STATUS, CREATED_AT
 */
const PrizeService = {
  getSheet: () => {
    return Utils.ensureSheet(Config.SHEETS.PRIZES, Config.PRIZE_HEADERS);
  },

  toPrize: (row) => {
    const quantity = Number(row.quantity) || 0;
    let available = row.available === '' ? quantity : Number(row.available);
    if (Number.isNaN(available)) available = 0;
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      quantity,
      available,
      status: row.status || (available > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'),
      createdAt: row.created_at,
    };
  },

  getAllPrizes: () => {
    const rows = Utils.readRows(PrizeService.getSheet());
    return rows.map((row) => PrizeService.toPrize(row));
  },

  getPrizeById: (id) => {
    const rows = Utils.readRows(PrizeService.getSheet());
    const found = Utils.findRow(rows, 'id', id);
    return found ? PrizeService.toPrize(found) : null;
  },

  createPrize: (name, description, quantity) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = PrizeService.getSheet();
      const now = Utils.getCurrentTimestamp();
      const data = {
        id: Utils.generateId(),
        name,
        description,
        quantity,
        available: quantity,
        status: quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
        created_at: now,
      };
      Utils.appendRow(sheet, Config.PRIZE_HEADERS, data);
      return PrizeService.toPrize(data);
    } finally {
      lock.releaseLock();
    }
  },

  updatePrize: (id, name, description, quantity) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = PrizeService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) {
        return { success: false, message: 'Prize not found' };
      }

      const newName = name !== undefined ? name : found.name;
      const newDescription = description !== undefined ? description : found.description;
      const newQuantity = quantity !== undefined ? Number(quantity) : Number(found.quantity);
      const awarded = Number(found.quantity) - Number(found.available);
      const newAvailable = Math.max(0, newQuantity - awarded);
      const newStatus = newAvailable > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';

      // NAME col 1, DESCRIPTION col 2, QUANTITY col 3, AVAILABLE col 4, STATUS col 5
      Utils.writeCell(sheet, found.rowIndex, 1, newName);
      Utils.writeCell(sheet, found.rowIndex, 2, newDescription);
      Utils.writeCell(sheet, found.rowIndex, 3, newQuantity);
      Utils.writeCell(sheet, found.rowIndex, 4, newAvailable);
      Utils.writeCell(sheet, found.rowIndex, 5, newStatus);

      return {
        success: true,
        data: {
          id: found.id,
          name: newName,
          description: newDescription,
          quantity: newQuantity,
          available: newAvailable,
          status: newStatus,
          createdAt: found.created_at,
        },
      };
    } finally {
      lock.releaseLock();
    }
  },

  deletePrize: (id) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = PrizeService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) {
        return { success: false, message: 'Prize not found' };
      }
      sheet.deleteRow(found.rowIndex);
      return { success: true, message: 'Prize deleted' };
    } finally {
      lock.releaseLock();
    }
  },

  decrementAvailable: (id) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = PrizeService.getSheet();
      const rows = Utils.readRows(sheet);
      const found = Utils.findRow(rows, 'id', id);
      if (!found) {
        return { success: false, message: 'Prize not found' };
      }
      const available = Number(found.available);
      if (available <= 0) {
        return { success: false, message: 'Prize is out of stock' };
      }
      const newAvailable = available - 1;
      const newStatus = newAvailable > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
      Utils.writeCell(sheet, found.rowIndex, 4, newAvailable);
      Utils.writeCell(sheet, found.rowIndex, 5, newStatus);
      return { success: true, data: { available: newAvailable, status: newStatus } };
    } finally {
      lock.releaseLock();
    }
  },

  statistics: () => {
    const prizes = PrizeService.getAllPrizes();
    return {
      totalPrizes: prizes.length,
      availablePrizes: prizes.reduce((acc, p) => acc + Math.max(0, Number(p.available)), 0),
      awardedPrizes: prizes.reduce(
        (acc, p) => acc + Math.max(0, Number(p.quantity) - Number(p.available)),
        0
      ),
    };
  },
};