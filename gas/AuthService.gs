/**
 * Authentication & authorization service.
 *
 * Uses a simple token-based session stored in CacheService (no external JWT
 * library). Passwords are hashed (SHA-256) and never exposed to the client.
 * Sheet columns: ID, NAME, EMAIL, ROLE, STATUS, CREATED_AT, LAST_LOGIN, PASSWORD_HASH
 */
const AuthService = {
  getSheet: () => {
    return Utils.ensureSheet(Config.SHEETS.USERS, Config.USER_HEADERS);
  },

  stripUser: (row) => {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status || 'ACTIVE',
    };
  },

  getAllUsers: () => {
    const sheet = AuthService.getSheet();
    const rows = Utils.readRows(sheet);
    return rows.map((row) => AuthService.stripUser(row));
  },

  bootstrap: () => {
    const sheet = AuthService.getSheet();
    if (sheet.getLastRow() <= 1) {
      const now = Utils.getCurrentTimestamp();
      const data = {
        id: Utils.generateId(),
        name: Config.BOOTSTRAP_USER.name,
        email: Config.BOOTSTRAP_USER.email.toLowerCase(),
        role: Config.BOOTSTRAP_USER.role,
        status: 'ACTIVE',
        created_at: now,
        last_login: '',
        password_hash: Utils.hashPassword(Config.BOOTSTRAP_USER.password),
      };
      Utils.appendRow(sheet, Config.USER_HEADERS, data);
      ActivityService.log(data.id, data.name, 'SEED', 'AUTH', 'Bootstrap super admin created');
    }
  },

  login: (email, password) => {
    const trimmedEmail = Utils.sanitize(email).toLowerCase();
    const trimmedPassword = String(password || '');
    if (!Utils.isValidEmail(trimmedEmail) || !trimmedPassword) {
      return { success: false, message: 'Email or password invalid' };
    }

    const sheet = AuthService.getSheet();
    const rows = Utils.readRows(sheet);
    const user = Utils.findRow(rows, 'email', trimmedEmail);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    if (user.status !== 'ACTIVE') {
      return { success: false, message: 'Account is disabled' };
    }

    const hash = Utils.hashPassword(trimmedPassword);
    if (hash !== user.password_hash) {
      return { success: false, message: 'Invalid email or password' };
    }

    const token = Utils.generateToken();
    const safeUser = AuthService.stripUser(user);
    const cache = CacheService.getScriptCache();
    cache.put(token, JSON.stringify(safeUser), Config.SESSION_TTL_SECONDS);

    // Update last login timestamp (LAST_LOGIN is column 6, 0-based)
    Utils.writeCell(sheet, user.rowIndex, 6, Utils.getCurrentTimestamp());

    ActivityService.log(safeUser.id, safeUser.name, 'LOGIN', 'AUTH', 'User logged in');
    return { success: true, message: 'Login successful', data: { token, user: safeUser } };
  },

  logout: (token) => {
    if (token) {
      const cache = CacheService.getScriptCache();
      const cached = cache.get(token);
      if (cached) {
        const user = JSON.parse(cached);
        cache.remove(token);
        ActivityService.log(user.id, user.name, 'LOGOUT', 'AUTH', 'User logged out');
      }
    }
    return { success: true, message: 'Logged out' };
  },

  /**
   * Validate a token and return the authenticated user, or null.
   */
  getSession: (token) => {
    if (!token) return null;
    const cache = CacheService.getScriptCache();
    const cached = cache.get(token);
    if (!cached) return null;
    try {
      const user = JSON.parse(cached);
      return user && user.email ? user : null;
    } catch (e) {
      return null;
    }
  },

  getCurrentUser: (token) => {
    const user = AuthService.getSession(token);
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }
    return { success: true, data: user };
  },

  updateUser: (actor, userId, updates) => {
    // Only SUPERADMIN can manage users; ADMIN can view but role/status changes limited.
    if (actor.role !== 'SUPERADMIN') {
      return { success: false, message: 'Only SUPERADMIN can modify users' };
    }
    const sheet = AuthService.getSheet();
    const rows = Utils.readRows(sheet);
    const target = Utils.findRow(rows, 'id', userId);
    if (!target) {
      return { success: false, message: 'User not found' };
    }
    if (String(target.id) === String(actor.id) && updates.status === 'INACTIVE') {
      return { success: false, message: 'You cannot disable your own account' };
    }

    const allowedRoles = Utils.ROLES;
    if (updates.role !== undefined) {
      const role = String(updates.role).toUpperCase();
      if (allowedRoles.indexOf(role) === -1) {
        return { success: false, message: 'Invalid role' };
      }
      Utils.writeCell(sheet, target.rowIndex, 3, role);
    }
    if (updates.status !== undefined) {
      const status = String(updates.status).toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      Utils.writeCell(sheet, target.rowIndex, 4, status);
    }
    if (updates.name !== undefined) {
      Utils.writeCell(sheet, target.rowIndex, 1, Utils.sanitize(updates.name));
    }
    if (updates.email !== undefined && Utils.isValidEmail(updates.email)) {
      Utils.writeCell(sheet, target.rowIndex, 2, Utils.sanitize(updates.email).toLowerCase());
    }

    ActivityService.log(actor.id, actor.name, 'UPDATE', 'ADMIN', 'Updated user ' + target.name);
    const fresh = Utils.findRow(Utils.readRows(sheet), 'id', userId);
    return { success: true, data: AuthService.stripUser(fresh) };
  },
};