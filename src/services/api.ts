import type {
  ApiEnvelope,
  ActivityLog,
  AuthUser,
  CheckinResponse,
  EventSettings,
  EventStatistics,
  LoginData,
  Participant,
  Prize,
  RecentActivityItem,
  RegisterResponse,
  UserRow,
  Winner,
  Competition,
  CompetitionParticipant,
  Team,
  TeamMember,
  Score,
  ScoreHistory,
  Nomination,
  CompetitionWinner,
  LeaderboardEntry,
  CompetitionStatistics,
  LiveCompetition,
} from '../types/hutRi';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.warn('VITE_API_URL is not set. Please check your .env file.');
}

// Fallback URL to prevent app crash if API_URL is missing
const safeAPIURL = API_URL || 'https://example.com/api';

const TOKEN_KEY = 'hutri81_token';

export const tokenStore = {
  get: (): string => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  },
  set: (token: string): void => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

interface RequestOptions {
  method?: 'GET' | 'POST';
  action: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

async function request<T>({ method = 'GET', action, params, body }: RequestOptions): Promise<ApiEnvelope<T>> {
  const url = new URL(safeAPIURL);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }
  const token = tokenStore.get();
  if (token) url.searchParams.set('token', token);

  // Use a CORS-simple Content-Type. Sending `application/json` triggers a
  // preflight (OPTIONS) request that Google Apps Script Web Apps do not
  // reliably answer. `text/plain;charset=UTF-8` keeps the request "simple"
  // (no preflight) while still carrying a JSON string body that GAS parses
  // from e.postData.contents via JSON.parse.
  const init: RequestInit = { method, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } };
  if (body) init.body = JSON.stringify({ ...body, token });

  let response: Response;
  try {
    response = await fetch(url.toString(), init);
  } catch {
    throw new Error('Network error. Periksa koneksi atau endpoint API Anda.');
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error('Respons API tidak valid (bukan JSON).');
  }

  const payload = json as { success: boolean; message: string; data: T; error?: string | null };
  return {
    success: !!payload.success,
    message: payload.message || (payload.success ? 'Sukses' : 'Terjadi kesalahan'),
    data: payload.data,
    error: payload.error ?? null,
  } as ApiEnvelope<T>;
}

const api = {
  async login(email: string, password: string): Promise<ApiEnvelope<LoginData>> {
    return request<LoginData>({ method: 'POST', action: 'login', body: { email, password } });
  },
  async logout(token: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'logout', body: { token } });
  },
  async getCurrentUser(token: string): Promise<ApiEnvelope<AuthUser>> {
    return request<AuthUser>({ action: 'getCurrentUser', params: { token } });
  },
  async register(data: { name: string; department: string }): Promise<ApiEnvelope<RegisterResponse>> {
    return request<RegisterResponse>({ method: 'POST', action: 'register', body: data });
  },
  async checkin(uniqueCode: string): Promise<ApiEnvelope<CheckinResponse>> {
    return request<CheckinResponse>({ method: 'POST', action: 'checkin', body: { uniqueCode } });
  },
  async getParticipants(): Promise<ApiEnvelope<Participant[]>> {
    return request<Participant[]>({ action: 'participants' });
  },
  async getParticipantByCode(code: string): Promise<ApiEnvelope<Participant>> {
    return request<Participant>({ action: 'participant', params: { code } });
  },
  async getParticipantById(id: string): Promise<ApiEnvelope<Participant>> {
    return request<Participant>({ action: 'participant', params: { id } });
  },
  async searchParticipants(q: string, department?: string, status?: string): Promise<ApiEnvelope<Participant[]>> {
    return request<Participant[]>({
      action: 'searchParticipants',
      params: { q, department: department || '', status: status || '' },
    });
  },
  async getPrizes(): Promise<ApiEnvelope<Prize[]>> {
    return request<Prize[]>({ action: 'getPrizes' });
  },
  async createPrize(data: { name: string; description: string; quantity: number }): Promise<ApiEnvelope<Prize>> {
    return request<Prize>({ method: 'POST', action: 'createPrize', body: data });
  },
  async updatePrize(data: { id: string; name?: string; description?: string; quantity?: number }): Promise<ApiEnvelope<Prize>> {
    return request<Prize>({ method: 'POST', action: 'updatePrize', body: data });
  },
  async deletePrize(id: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'deletePrize', body: { id } });
  },
  async getEligibleParticipants(): Promise<ApiEnvelope<Participant[]>> {
    return request<Participant[]>({ action: 'getEligibleParticipants' });
  },
  async drawWinner(prizeId: string): Promise<ApiEnvelope<Winner>> {
    return request<Winner>({ method: 'POST', action: 'drawWinner', body: { prizeId } });
  },
  async saveWinner(participantId: string, prizeId: string): Promise<ApiEnvelope<Winner>> {
    return request<Winner>({ method: 'POST', action: 'saveWinner', body: { participantId, prizeId } });
  },
  async getWinners(): Promise<ApiEnvelope<Winner[]>> {
    return request<Winner[]>({ action: 'getWinners' });
  },
  async getWinnerById(id: string): Promise<ApiEnvelope<Winner>> {
    return request<Winner>({ action: 'getWinner', params: { id } });
  },
  async getStatistics(): Promise<ApiEnvelope<EventStatistics>> {
    return request<EventStatistics>({ action: 'stats' });
  },
  async getRecentActivity(): Promise<ApiEnvelope<RecentActivityItem[]>> {
    return request<RecentActivityItem[]>({ action: 'getRecentActivity' });
  },
  async getUsers(): Promise<ApiEnvelope<UserRow[]>> {
    return request<UserRow[]>({ action: 'getUsers' });
  },
  async updateUser(userId: string, updates: { role?: string; status?: string; name?: string; email?: string }): Promise<ApiEnvelope<UserRow>> {
    return request<UserRow>({ method: 'POST', action: 'updateUser', body: { userId, ...updates } });
  },
  async createUser(data: { name: string; email: string; password: string; role: string }): Promise<ApiEnvelope<UserRow>> {
    return request<UserRow>({ method: 'POST', action: 'createUser', body: data });
  },
  async getActivityLogs(limit?: number): Promise<ApiEnvelope<ActivityLog[]>> {
    return request<ActivityLog[]>({ action: 'getActivityLogs', params: { limit: limit ? String(limit) : '' } });
  },
  async getSettings(): Promise<ApiEnvelope<EventSettings>> {
    return request<EventSettings>({ action: 'getSettings' });
  },

  // Competition APIs
  async getCompetitions(): Promise<ApiEnvelope<Competition[]>> {
    return request<Competition[]>({ action: 'getCompetitions' });
  },

  async getCompetition(id: string): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ action: 'getCompetition', params: { id } });
  },

  async createCompetition(data: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ method: 'POST', action: 'createCompetition', body: data });
  },

  async updateCompetition(id: string, updates: Partial<Competition>): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ method: 'POST', action: 'updateCompetition', body: { id, ...updates } });
  },

  async deleteCompetition(id: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'deleteCompetition', body: { id } });
  },

  async startCompetition(id: string): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ method: 'POST', action: 'startCompetition', body: { id } });
  },

  async finishCompetition(id: string): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ method: 'POST', action: 'finishCompetition', body: { id } });
  },

  async cancelCompetition(id: string): Promise<ApiEnvelope<Competition>> {
    return request<Competition>({ method: 'POST', action: 'cancelCompetition', body: { id } });
  },

  // Competition Participants APIs
  async getCompetitionParticipants(competitionId: string): Promise<ApiEnvelope<CompetitionParticipant[]>> {
    return request<CompetitionParticipant[]>({ action: 'getCompetitionParticipants', params: { competitionId } });
  },

  async addCompetitionParticipant(competitionId: string, participantId: string): Promise<ApiEnvelope<CompetitionParticipant>> {
    return request<CompetitionParticipant>({ method: 'POST', action: 'addCompetitionParticipant', body: { competitionId, participantId } });
  },

  async removeCompetitionParticipant(competitionId: string, participantId: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'removeCompetitionParticipant', body: { competitionId, participantId } });
  },

  // Teams APIs
  async getTeams(competitionId?: string): Promise<ApiEnvelope<Team[]>> {
    return request<Team[]>({ action: 'getTeams', params: competitionId ? { competitionId } : {} });
  },

  async getTeam(id: string): Promise<ApiEnvelope<Team>> {
    return request<Team>({ action: 'getTeam', params: { id } });
  },

  async createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiEnvelope<Team>> {
    return request<Team>({ method: 'POST', action: 'createTeam', body: data });
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<ApiEnvelope<Team>> {
    return request<Team>({ method: 'POST', action: 'updateTeam', body: { id, ...updates } });
  },

  async deleteTeam(id: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'deleteTeam', body: { id } });
  },

  async addTeamMember(teamId: string, participantId: string): Promise<ApiEnvelope<TeamMember>> {
    return request<TeamMember>({ method: 'POST', action: 'addTeamMember', body: { teamId, participantId } });
  },

  async removeTeamMember(teamId: string, participantId: string): Promise<ApiEnvelope<{ ok: boolean }>> {
    return request<{ ok: boolean }>({ method: 'POST', action: 'removeTeamMember', body: { teamId, participantId } });
  },

  async setTeamCaptain(teamId: string, participantId: string): Promise<ApiEnvelope<Team>> {
    return request<Team>({ method: 'POST', action: 'setTeamCaptain', body: { teamId, participantId } });
  },

  async disqualifyTeam(id: string): Promise<ApiEnvelope<Team>> {
    return request<Team>({ method: 'POST', action: 'disqualifyTeam', body: { id } });
  },

  // Scoring APIs
  async getScores(competitionId: string): Promise<ApiEnvelope<Score[]>> {
    return request<Score[]>({ action: 'getScores', params: { competitionId } });
  },

  async saveScore(data: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiEnvelope<Score>> {
    return request<Score>({ method: 'POST', action: 'saveScore', body: data });
  },

  async updateScore(id: string, updates: Partial<Score>, reason?: string): Promise<ApiEnvelope<Score>> {
    return request<Score>({ method: 'POST', action: 'updateScore', body: { id, ...updates, reason } });
  },

  async getScoreHistory(competitionId: string): Promise<ApiEnvelope<ScoreHistory[]>> {
    return request<ScoreHistory[]>({ action: 'getScoreHistory', params: { competitionId } });
  },

  // Leaderboard APIs
  async getLeaderboard(competitionId?: string): Promise<ApiEnvelope<LeaderboardEntry[]>> {
    return request<LeaderboardEntry[]>({ action: 'getLeaderboard', params: competitionId ? { competitionId } : {} });
  },

  // Nominations APIs
  async getNominations(competitionId?: string): Promise<ApiEnvelope<Nomination[]>> {
    return request<Nomination[]>({ action: 'getNominations', params: competitionId ? { competitionId } : {} });
  },

  async createNomination(data: Omit<Nomination, 'id' | 'createdAt' | 'confirmedAt' | 'confirmedBy' | 'status' | 'createdBy'>): Promise<ApiEnvelope<Nomination>> {
    return request<Nomination>({ method: 'POST', action: 'createNomination', body: data });
  },

  async updateNomination(id: string, updates: Partial<Nomination>): Promise<ApiEnvelope<Nomination>> {
    return request<Nomination>({ method: 'POST', action: 'updateNomination', body: { id, ...updates } });
  },

  async confirmNomination(id: string): Promise<ApiEnvelope<Nomination>> {
    return request<Nomination>({ method: 'POST', action: 'confirmNomination', body: { id } });
  },

  async rejectNomination(id: string): Promise<ApiEnvelope<Nomination>> {
    return request<Nomination>({ method: 'POST', action: 'rejectNomination', body: { id } });
  },

  // Competition Winners APIs
  async getCompetitionWinners(competitionId?: string): Promise<ApiEnvelope<CompetitionWinner[]>> {
    return request<CompetitionWinner[]>({ action: 'getCompetitionWinners', params: competitionId ? { competitionId } : {} });
  },

  async confirmCompetitionWinner(competitionId: string, participantId: string | null, teamId: string | null, position: number, category: string, score: number | null): Promise<ApiEnvelope<CompetitionWinner>> {
    return request<CompetitionWinner>({ method: 'POST', action: 'confirmCompetitionWinner', body: { competitionId, participantId, teamId, position, category, score } });
  },

  // Live APIs
  async getLiveCompetition(id: string): Promise<ApiEnvelope<LiveCompetition>> {
    return request<LiveCompetition>({ action: 'getLiveCompetition', params: { id } });
  },

  async getLiveLeaderboard(): Promise<ApiEnvelope<LeaderboardEntry[]>> {
    return request<LeaderboardEntry[]>({ action: 'getLiveLeaderboard' });
  },

  async getLiveNominations(): Promise<ApiEnvelope<Nomination[]>> {
    return request<Nomination[]>({ action: 'getLiveNominations' });
  },

  async getLiveWinners(): Promise<ApiEnvelope<CompetitionWinner[]>> {
    return request<CompetitionWinner[]>({ action: 'getLiveWinners' });
  },

  // Competition Dashboard Statistics
  async getCompetitionStatistics(): Promise<ApiEnvelope<CompetitionStatistics>> {
    return request<CompetitionStatistics>({ action: 'getCompetitionStatistics' });
  },
};

export default api;