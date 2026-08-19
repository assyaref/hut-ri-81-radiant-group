/**
 * Utility functions
 */
const Utils = {
  getScriptLock: () => LockService.getScriptLock(),

  isDevelopment: () => processEnv === 'development',

  getCurrentTimestamp: () => new Date().toISOString(),

  sanitize: (value) => {
    if (value == null) return '';
    return String(value)
      .replace(/[<>]/g, '')
      .replace(/\r?\n/g, ' ')
      .replace(/^\s+|\s+$/g, '');
  },

  isValidEmail: (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  generateId: () => {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  generateUniqueCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HUTRI81XRG-${code}`;
  },

  /**
   * Generate a random session token. Uses CacheService-friendly token.
   */
  generateToken: () => {
    const uuid = Utilities.getUuid().replace(/-/g, '');
    return 'sess_' + uuid + Math.floor(Math.random() * 1000000).toString(36);
  },

  hashPassword: (password) => {
    const digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(password),
      Utilities.Charset.UTF_8
    );
    let hash = '';
    for (let i = 0; i < digest.length; i++) {
      hash += ((digest[i] + 256) % 256).toString(16).padStart(2, '0');
    }
    return hash;
  },

  getSpreadsheet: () => {
    if (!Config.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID not configured');
    }
    return SpreadsheetApp.openById(Config.SPREADSHEET_ID);
  },

  ensureSheet: (name, headers) => {
    const spreadsheet = Utils.getSpreadsheet();
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
    return sheet;
  },

  /**
   * Read all rows from a sheet into an array of objects keyed by lowercased headers.
   */
  readRows: (sheet) => {
    const range = sheet.getDataRange();
    const numRows = range.getNumRows();
    if (numRows === 0) return [];
    const values = range.getValues();
    const headers = values[0].map((h) => String(h).trim());

    const rows = [];
    for (let i = 1; i < numRows; i++) {
      const obj = { rowIndex: i + 1 };
      let isEmpty = true;
      headers.forEach((header, col) => {
        if (!header) return;
        const cell = values[i][col];
        obj[header.toLowerCase()] = cell == null ? '' : cell;
        if (cell != null && String(cell).trim() !== '') {
          isEmpty = false;
        }
      });
      if (!isEmpty) rows.push(obj);
    }
    return rows;
  },

  findRow: (rows, key, value) => {
    for (const row of rows) {
      if (String(row[key] ?? '') === String(value)) {
        return row;
      }
    }
    return null;
  },

  appendRow: (sheet, headers, data) => {
    const row = headers.map((header) => {
      const value = data[String(header).toLowerCase()];
      return value === undefined ? '' : value;
    });
    sheet.appendRow(row);
  },

  writeCell: (sheet, rowIndex, columnIndex, value) => {
    sheet.getRange(rowIndex, columnIndex + 1).setValue(value);
  },

  // Allowed user roles (ordered by privilege)
  ROLES: ['VIEWER', 'OPERATOR', 'ADMIN', 'SUPERADMIN'],

  roleRank: (role) => {
    const idx = Utils.ROLES.indexOf(role);
    return idx === -1 ? -1 : idx;
  },

  hasRole: (user, required) => {
    if (!user) return false;
    return Utils.roleRank(user.role) >= Utils.roleRank(required);
  },
};