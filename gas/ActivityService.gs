/**
 * Activity logging service
 * Sheet columns: ID, USER_ID, USER_NAME, ACTION, MODULE, DESCRIPTION, TIMESTAMP
 */
const ActivityService = {
  getSheet: () => {
    return Utils.ensureSheet(Config.SHEETS.ACTIVITY_LOG, Config.ACTIVITY_HEADERS);
  },

  log: (userId, userName, action, module, description) => {
    try {
      const sheet = ActivityService.getSheet();
      const data = {
        id: Utils.generateId(),
        user_id: userId || '',
        user_name: Utils.sanitize(userName) || '',
        action: Utils.sanitize(action) || '',
        module: Utils.sanitize(module) || '',
        description: Utils.sanitize(description) || '',
        timestamp: Utils.getCurrentTimestamp(),
      };
      Utils.appendRow(sheet, Config.ACTIVITY_HEADERS, data);
    } catch (err) {
      // Logging must never break the main flow.
      console.error('Activity log failed: ' + err.message);
    }
  },

  getLogs: (limit) => {
    const sheet = ActivityService.getSheet();
    const rows = Utils.readRows(sheet).reverse();
    const count = limit ? Math.min(Number(limit), 200) : 100;
    return rows.slice(0, count).map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      action: row.action,
      module: row.module,
      description: row.description,
      timestamp: row.timestamp,
    }));
  },
};