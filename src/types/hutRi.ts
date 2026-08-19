export type Role = 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'VIEWER';

export type ParticipantStatus = 'REGISTERED' | 'CHECKED_IN';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface Participant {
  id: string;
  name: string;
  department: string;
  uniqueCode: string;
  status: ParticipantStatus;
  registeredAt: string;
  checkedInAt: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  quantity: number;
  available: number;
  status: string;
  createdAt: string;
}

export interface Winner {
  id: string;
  participantId: string;
  participantName: string;
  department: string;
  uniqueCode: string;
  prizeId: string;
  prizeName: string;
  wonAt: string;
  status: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
}

export interface LoginData {
  token: string;
  user: AuthUser;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  createdAt: string;
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
}

export interface EventStatistics {
  totalParticipants: number;
  totalCheckedIn: number;
  totalPending: number;
  totalPrizes: number;
  availablePrizes: number;
  awardedPrizes: number;
  totalWinners: number;
  recentParticipants: Participant[];
  recentCheckins: Participant[];
  recentWinners: Winner[];
}

export interface RecentActivityItem {
  type: string;
  label: string;
  timestamp: string;
}

export interface EventSettings {
  eventName: string;
  organization: string;
  tagline: string;
  sessionTtlSeconds: number;
}

export interface Statistic {
  label: string;
  value: number | string;
  icon: string;
}

export interface QuickAction {
  label: string;
  path: string;
  icon: string;
  color: string;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  department: string;
  uniqueCode: string;
  checkin_status: string;
  created_at: string;
}

export interface CheckinResponse {
  name: string;
  department: string;
  uniqueCode: string;
  checkin_status: string;
  status: string;
}

// Competition Types
export type CompetitionType = 'INDIVIDUAL' | 'GROUP' | 'BOTH';
export type CompetitionStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'FINISHED' | 'CANCELLED';
export type ScoringMethod = 'SCORE' | 'RANK' | 'TIME';
export type TeamStatus = 'ACTIVE' | 'INACTIVE' | 'DISQUALIFIED';
export type NominationStatus = 'NOMINATED' | 'CONFIRMED' | 'REJECTED';
export type NominationCategory = 'JUARA_1' | 'JUARA_2' | 'JUARA_3' | 'BEST_TEAM' | 'BEST_YEL_YEL';
export type CompetitionParticipantStatus = 'REGISTERED' | 'CHECKED_IN' | 'COMPLETED';

export interface Competition {
  id: string;
  title: string;
  type: CompetitionType;
  description: string;
  status: CompetitionStatus;
  maxParticipants: number;
  maxGroupSize: number;
  scoringMethod: ScoringMethod;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  participantCount?: number;
  teamCount?: number;
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  participantId: string;
  status: CompetitionParticipantStatus;
  registeredAt: string;
  participant?: Participant;
}

export interface Team {
  id: string;
  competitionId: string;
  name: string;
  department: string;
  captainParticipantId: string;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  participantId: string;
  joinedAt: string;
  participant?: Participant;
}

export interface Score {
  id: string;
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  method: ScoringMethod;
  score: number | null;
  timeMs: number | null;
  rank: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  participantName?: string;
  teamName?: string;
}

export interface ScoreHistory {
  id: string;
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  previousScore: number | null;
  newScore: number | null;
  changedBy: string;
  reason: string;
  changedAt: string;
}

export interface Nomination {
  id: string;
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  category: NominationCategory;
  position: number;
  status: NominationStatus;
  createdBy: string;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  participantName?: string;
  teamName?: string;
  competitionName?: string;
  department?: string;
}

export interface CompetitionWinner {
  id: string;
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  position: number;
  category: string;
  score: number | null;
  confirmedBy: string;
  confirmedAt: string;
  competition?: Competition;
  participant?: Participant;
  team?: Team;
  competitionName?: string;
  participantName?: string;
  teamName?: string;
  department?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  department: string;
  competitionId: string;
  competitionName: string;
  score: number | null;
  timeMs: number | null;
  isTeam: boolean;
  tie?: boolean;
}

export interface CompetitionStatistics {
  totalCompetitions: number;
  runningCompetitions: number;
  finishedCompetitions: number;
  totalScores: number;
  totalNominations: number;
  competitionWinners: number;
}

export interface LiveCompetition {
  competition: Competition | null;
  leaderboard: LeaderboardEntry[];
  nominations: Nomination[];
  winners: CompetitionWinner[];
}