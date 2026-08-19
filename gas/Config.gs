/**
 * Configuration settings
 *
 * SPREADSHEET_ID is read from Script Properties (set in the GAS editor
 * under Project Settings -> Script Properties). Never hardcode it.
 */
const Config = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),

  CORS_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:4173',
    // Add your deployed frontend URL here
    // 'https://your-username.github.io'
  ],

  ALLOWED_ORIGINS: function () {
    return this.CORS_ORIGINS;
  },

  // Sheet names
  SHEETS: {
    PARTICIPANTS: 'Participants',
    PRIZES: 'Prizes',
    WINNERS: 'Winners',
    USERS: 'Users',
    ACTIVITY_LOG: 'ActivityLog',
    COMPETITIONS: 'Competitions',
    COMPETITION_PARTICIPANTS: 'CompetitionParticipants',
    TEAMS: 'Teams',
    TEAM_MEMBERS: 'TeamMembers',
    SCORES: 'Scores',
    SCORE_HISTORY: 'ScoreHistory',
    NOMINATIONS: 'Nominations',
    COMPETITION_WINNERS: 'CompetitionWinners',
  },

  // Column definitions
  PARTICIPANT_HEADERS: ['ID', 'NAME', 'DEPARTMENT', 'UNIQUE_CODE', 'STATUS', 'REGISTERED_AT', 'CHECKED_IN_AT'],
  PRIZE_HEADERS: ['ID', 'NAME', 'DESCRIPTION', 'QUANTITY', 'AVAILABLE', 'STATUS', 'CREATED_AT'],
  WINNER_HEADERS: ['ID', 'PARTICIPANT_ID', 'PARTICIPANT_NAME', 'DEPARTMENT', 'UNIQUE_CODE', 'PRIZE_ID', 'PRIZE_NAME', 'WON_AT', 'STATUS'],
  USER_HEADERS: ['ID', 'NAME', 'EMAIL', 'ROLE', 'STATUS', 'CREATED_AT', 'LAST_LOGIN', 'PASSWORD_HASH'],
  ACTIVITY_HEADERS: ['ID', 'USER_ID', 'USER_NAME', 'ACTION', 'MODULE', 'DESCRIPTION', 'TIMESTAMP'],

  COMPETITION_HEADERS: ['ID', 'TITLE', 'TYPE', 'DESCRIPTION', 'STATUS', 'MAX_PARTICIPANTS', 'MAX_GROUP_SIZE', 'SCORING_METHOD', 'START_TIME', 'END_TIME', 'CREATED_AT', 'UPDATED_AT'],
  COMPETITION_PARTICIPANT_HEADERS: ['ID', 'COMPETITION_ID', 'PARTICIPANT_ID', 'STATUS', 'REGISTERED_AT'],
  TEAM_HEADERS: ['ID', 'COMPETITION_ID', 'NAME', 'DEPARTMENT', 'CAPTAIN_PARTICIPANT_ID', 'STATUS', 'CREATED_AT', 'UPDATED_AT'],
  TEAM_MEMBER_HEADERS: ['ID', 'TEAM_ID', 'PARTICIPANT_ID', 'JOINED_AT'],
  SCORE_HEADERS: ['ID', 'COMPETITION_ID', 'PARTICIPANT_ID', 'TEAM_ID', 'METHOD', 'SCORE', 'TIME_MS', 'RANK', 'STATUS', 'CREATED_AT', 'UPDATED_AT'],
  SCORE_HISTORY_HEADERS: ['ID', 'COMPETITION_ID', 'PARTICIPANT_ID', 'TEAM_ID', 'PREVIOUS_SCORE', 'NEW_SCORE', 'CHANGED_BY', 'REASON', 'CHANGED_AT'],
  NOMINATION_HEADERS: ['ID', 'COMPETITION_ID', 'PARTICIPANT_ID', 'TEAM_ID', 'CATEGORY', 'POSITION', 'STATUS', 'CREATED_BY', 'CREATED_AT', 'CONFIRMED_BY', 'CONFIRMED_AT'],
  COMPETITION_WINNER_HEADERS: ['ID', 'COMPETITION_ID', 'PARTICIPANT_ID', 'TEAM_ID', 'POSITION', 'CATEGORY', 'SCORE', 'CONFIRMED_BY', 'CONFIRMED_AT'],

  // Scoring points conversion for RANK method (1st, 2nd, 3rd, 4th, 5th, ...)
  RANK_POINTS: [100, 75, 50, 40, 30],

  // Allow public (unauthenticated) read access to live monitor endpoints.
  LIVE_PUBLIC: true,

  // Default competitions seeded when the Competitions sheet is empty.
  DEFAULT_COMPETITIONS: [
    { title: 'Lomba Gulir Bola Pingpong', type: 'GROUP', description: 'Menggulirkan bola pingpong secara estafet dalam tim.', scoring_method: 'SCORE', max_participants: 200, max_group_size: 5 },
    { title: 'Lomba Susun Huruf', type: 'GROUP', description: 'Menyusun huruf menjadi kata dengan cepat.', scoring_method: 'TIME', max_participants: 200, max_group_size: 4 },
    { title: 'Lomba Makan Kerupuk', type: 'INDIVIDUAL', description: 'Menghabiskan kerupuk tanpa menggunakan tangan.', scoring_method: 'TIME', max_participants: 100, max_group_size: 1 },
    { title: 'Estafet Balon', type: 'GROUP', description: 'Membawa balon secara estafet antar anggota tim.', scoring_method: 'TIME', max_participants: 200, max_group_size: 4 },
    { title: 'Estafet Isi Air dengan Spons', type: 'GROUP', description: 'Memindahkan air menggunakan spons secara estafet.', scoring_method: 'TIME', max_participants: 200, max_group_size: 4 },
    { title: 'Cerdas Cermat', type: 'GROUP', description: 'Kuis pengetahuan umum antar kelompok.', scoring_method: 'SCORE', max_participants: 100, max_group_size: 3 },
    { title: 'Penampilan Yel-Yel Kelompok', type: 'GROUP', description: 'Penampilan yel-yel kreatif setiap kelompok.', scoring_method: 'SCORE', max_participants: 200, max_group_size: 10 },
  ],

  // Session TTL (seconds)
  SESSION_TTL_SECONDS: 21600, // 6 hours

  // Default bootstrap user (only created if no users exist yet).
  // Change these after first login. Only stored on the backend.
  BOOTSTRAP_USER: {
    name: 'Super Admin',
    email: 'admin@radiantgroup.id',
    password: 'Admin@81Radiant',
    role: 'SUPERADMIN',
  },
};

const processEnv = 'production';