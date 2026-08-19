/**
 * Main entry point for Google Apps Script
 *
 * Routing is based on the ?action= query parameter. Authenticated endpoints
 * read a session token from the "token" query param or from the request body.
 * Session tokens are stored in CacheService and validated on the backend only.
 */

function resolveUser(e) {
  let token = null;
  if (e.parameter && e.parameter.token) {
    token = e.parameter.token;
  }
  if (!token && e && e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      if (parsed.token) token = parsed.token;
    } catch (err) { /* ignore */ }
  }
  return AuthService.getSession(token || '');
}

function authorize(e, requiredRole) {
  const user = resolveUser(e);
  if (!user) {
    return { error: 'Not authenticated' };
  }
  if (requiredRole && !Utils.hasRole(user, requiredRole)) {
    return { error: 'Insufficient permissions' };
  }
  return { user };
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  try {
    AuthService.bootstrap();
    CompetitionService.ensureDefaults();

    switch (action) {
      case 'heartbeat':
        return Response.success({ status: 'ok' }, 'API is running');

      case 'getCurrentUser': {
        const user = resolveUser(e);
        if (!user) return Response.error('Not authenticated', 'AuthError');
        return Response.success(user, 'Current user');
      }

      case 'participants': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ParticipantService.getAllParticipants(), 'Participants retrieved');
      }

      case 'participant': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const participant = e.parameter.code
          ? ParticipantService.getParticipantByCode(e.parameter.code)
          : (e.parameter.id ? ParticipantService.getParticipantById(e.parameter.id) : null);
        if (!participant) return Response.error('Participant not found', 'NotFound');
        return Response.success(participant, 'Participant retrieved');
      }

      case 'searchParticipants': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = ParticipantService.searchParticipants(
          e.parameter.q,
          e.parameter.department,
          e.parameter.status
        );
        return Response.success(result, 'Search results');
      }

      case 'stats': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(DashboardService.getStatistics(), 'Statistics retrieved');
      }

      case 'getEligibleParticipants': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ParticipantService.getEligibleParticipants(), 'Eligible participants');
      }

      case 'getPrizes': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(PrizeService.getAllPrizes(), 'Prizes retrieved');
      }

      case 'getWinners': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(WinnerService.getAllWinners(), 'Winners retrieved');
      }

      case 'getWinner': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const winner = WinnerService.getWinnerById(e.parameter.id);
        if (!winner) return Response.error('Winner not found', 'NotFound');
        return Response.success(winner, 'Winner retrieved');
      }

      case 'getActivityLogs': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ActivityService.getLogs(e.parameter.limit), 'Activity logs retrieved');
      }

      case 'getUsers': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(AuthService.getAllUsers(), 'Users retrieved');
      }

      case 'getSettings': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(DashboardService.getSettings(), 'Settings retrieved');
      }

      case 'getRecentActivity':
        return Response.success(DashboardService.getRecentActivity(), 'Recent activity');

      // ----- COMPETITIONS -----
      case 'getCompetitions': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(CompetitionService.getAllCompetitions(), 'Competitions retrieved');
      }

      case 'getCompetition': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const competition = CompetitionService.getCompetition(e.parameter.id);
        if (!competition) return Response.error('Competition not found', 'NotFound');
        return Response.success(competition, 'Competition retrieved');
      }

      case 'getCompetitionParticipants': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(CompetitionParticipantService.getByCompetition(e.parameter.competitionId), 'Participants retrieved');
      }

      case 'getTeams': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(TeamService.getAllTeams(e.parameter.competitionId), 'Teams retrieved');
      }

      case 'getTeam': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const team = TeamService.getTeam(e.parameter.id);
        if (!team) return Response.error('Team not found', 'NotFound');
        return Response.success(team, 'Team retrieved');
      }

      case 'getScores': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ScoringService.getScores(e.parameter.competitionId), 'Scores retrieved');
      }

      case 'getScoreHistory': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ScoringService.getScoreHistory(e.parameter.competitionId), 'Score history retrieved');
      }

      case 'getLeaderboard': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ScoringService.getLeaderboard(e.parameter.competitionId), 'Leaderboard retrieved');
      }

      case 'getNominations': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(NominationService.getNominations(e.parameter.competitionId), 'Nominations retrieved');
      }

      case 'getCompetitionWinners': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(CompetitionWinnerService.getWinners(e.parameter.competitionId), 'Winners retrieved');
      }

      case 'getCompetitionStatistics': {
        const auth = authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(CompetitionDashboardService.getStatistics(), 'Statistics retrieved');
      }

      // ----- LIVE -----
      case 'getLiveCompetition': {
        const auth = Config.LIVE_PUBLIC ? { user: null } : authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const id = e.parameter.id;
        return Response.success({
          competition: id ? CompetitionService.getCompetition(id) : null,
          leaderboard: id ? ScoringService.getLeaderboard(id) : [],
          nominations: id ? NominationService.getNominations(id) : [],
          winners: id ? CompetitionWinnerService.getWinners(id) : [],
        }, 'Live competition');
      }

      case 'getLiveLeaderboard': {
        const auth = Config.LIVE_PUBLIC ? { user: null } : authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(ScoringService.getLeaderboard(), 'Live leaderboard');
      }

      case 'getLiveNominations': {
        const auth = Config.LIVE_PUBLIC ? { user: null } : authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(NominationService.getNominations(), 'Live nominations');
      }

      case 'getLiveWinners': {
        const auth = Config.LIVE_PUBLIC ? { user: null } : authorize(e, 'VIEWER');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        return Response.success(CompetitionWinnerService.getWinners(), 'Live winners');
      }

      default:
        return Response.error('Invalid action', 'NotFound', 404);
    }
  } catch (error) {
    return Response.error(error.message || 'Internal server error', 'ServerError', 500);
  }
}
function doPost(e) {
  try {
    AuthService.bootstrap();
    CompetitionService.ensureDefaults();

    const action = e && e.parameter ? e.parameter.action : '';

    if (!e.postData || !e.postData.contents) {
      return Response.error('Request body missing', 'BadRequest');
    }
    let payload = {};
    try {
      payload = JSON.parse(e.postData.contents) || {};
    } catch (err) {
      return Response.error('Invalid JSON body', 'BadRequest');
    }

    switch (action) {
      // ----- AUTH -----
      case 'login': {
        if (!payload.email || !payload.password) {
          return Response.error('Email and password are required', 'BadRequest');
        }
        const result = AuthService.login(payload.email, payload.password);
        if (!result.success) return Response.error(result.message, 'AuthError');
        return Response.success(result.data, result.message);
      }

      case 'logout': {
        AuthService.logout(payload.token || '');
        return Response.success({ ok: true }, 'Logged out');
      }

      // ----- PARTICIPANTS (public) -----
      case 'register': {
        const name = Utils.sanitize(payload.name);
        const department = Utils.sanitize(payload.department);
        if (!name || !department) {
          return Response.error('Name and department are required', 'BadRequest');
        }
        const newParticipant = ParticipantService.createParticipant(name, department);
        ActivityService.log('', '', 'REGISTER', 'PARTICIPANT', name + ' registered');
        return Response.success(
          {
            id: newParticipant.id,
            name: newParticipant.name,
            department: newParticipant.department,
            uniqueCode: newParticipant.uniqueCode,
            checkin_status: newParticipant.status,
            created_at: newParticipant.registeredAt,
          },
          'Registration successful'
        );
      }

      case 'checkin': {
        const code = Utils.sanitize(payload.uniqueCode).toUpperCase();
        if (!code) return Response.error('Unique code is required', 'BadRequest');
        const result = ParticipantService.updateCheckinStatus(code);
        if (!result.success) return Response.error(result.message, 'CheckinError');
        ActivityService.log('', '', 'CHECKIN', 'PARTICIPANT', result.data.name + ' checked in');
        return Response.success(
          {
            name: result.data.name,
            department: result.data.department,
            uniqueCode: result.data.unique_code,
            checkin_status: result.data.status,
            status: result.data.status,
          },
          'Check-in successful'
        );
      }

      // ----- PRIZES -----
      case 'createPrize': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const name = Utils.sanitize(payload.name);
        const quantity = Math.max(1, Math.floor(Number(payload.quantity)) || 1);
        if (!name) return Response.error('Prize name is required', 'BadRequest');
        const prize = PrizeService.createPrize(name, Utils.sanitize(payload.description || ''), quantity);
        ActivityService.log(auth.user.id, auth.user.name, 'CREATE', 'PRIZE', 'Created prize ' + name);
        return Response.success(prize, 'Prize created');
      }

      case 'updatePrize': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = PrizeService.updatePrize(
          payload.id,
          payload.name !== undefined ? Utils.sanitize(payload.name) : undefined,
          payload.description !== undefined ? Utils.sanitize(payload.description) : undefined,
          payload.quantity !== undefined ? Number(payload.quantity) : undefined
        );
        if (!result.success) return Response.error(result.message, 'PrizeError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE', 'PRIZE', 'Updated prize ' + result.data.name);
        return Response.success(result.data, 'Prize updated');
      }

      case 'deletePrize': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = PrizeService.deletePrize(payload.id);
        if (!result.success) return Response.error(result.message, 'PrizeError');
        ActivityService.log(auth.user.id, auth.user.name, 'DELETE', 'PRIZE', 'Deleted prize ' + payload.id);
        return Response.success({ ok: true }, 'Prize deleted');
      }

      // ----- SPIN -----
      case 'drawWinner': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const prizeId = payload.prizeId;
        if (!prizeId) return Response.error('prizeId is required', 'BadRequest');

        const prize = PrizeService.getPrizeById(prizeId);
        if (!prize) return Response.error('Prize not found', 'NotFound');
        if (prize.available <= 0) return Response.error('Prize is no longer available', 'PrizeError');

        const eligible = ParticipantService.getEligibleParticipants();
        if (eligible.length === 0) {
          return Response.error('No eligible participants', 'SpinError');
        }

        // Final random selection and winner persistence happen here so the
        // result is validated and enforced by the backend.
        const chosen = eligible[Math.floor(Math.random() * eligible.length)];

        const result = WinnerService.saveWinner(chosen.id, prizeId);
        if (!result.success) return Response.error(result.message, 'SpinError');

        ActivityService.log(auth.user.id, auth.user.name, 'DRAW', 'SPIN', chosen.name + ' won ' + prize.name);
        return Response.success(result.data, 'Winner drawn');
      }

      case 'saveWinner': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = WinnerService.saveWinner(payload.participantId, payload.prizeId);
        if (!result.success) return Response.error(result.message, 'SpinError');
        ActivityService.log(
          auth.user.id,
          auth.user.name,
          'SAVE_WINNER',
          'SPIN',
          result.data.participantName + ' won ' + result.data.prizeName
        );
        return Response.success(result.data, 'Winner saved');
      }

      // ----- ADMIN -----
      case 'updateUser': {
        const auth = authorize(e, 'SUPERADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = AuthService.updateUser(auth.user, payload.userId, {
          role: payload.role,
          status: payload.status,
          name: payload.name,
          email: payload.email,
        });
        if (!result.success) return Response.error(result.message, 'AdminError');
        return Response.success(result.data, 'User updated');
      }

      case 'createUser': {
        const auth = authorize(e, 'SUPERADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const name = Utils.sanitize(payload.name);
        const email = Utils.sanitize(payload.email).toLowerCase();
        const password = String(payload.password || '');
        const role = String(payload.role || 'VIEWER').toUpperCase();
        if (!name || !Utils.isValidEmail(email)) {
          return Response.error('Valid name and email are required', 'BadRequest');
        }
        if (password.length < 6) {
          return Response.error('Password must be at least 6 characters', 'BadRequest');
        }
        if (Utils.ROLES.indexOf(role) === -1) {
          return Response.error('Invalid role', 'BadRequest');
        }
        const rows = Utils.readRows(AuthService.getSheet());
        if (Utils.findRow(rows, 'email', email)) {
          return Response.error('Email already exists', 'BadRequest');
        }
        const now = Utils.getCurrentTimestamp();
        const data = {
          id: Utils.generateId(),
          name,
          email,
          role,
          status: 'ACTIVE',
          created_at: now,
          last_login: '',
          password_hash: Utils.hashPassword(password),
        };
        Utils.appendRow(AuthService.getSheet(), Config.USER_HEADERS, data);
        ActivityService.log(auth.user.id, auth.user.name, 'CREATE', 'ADMIN', 'Created user ' + name);
        return Response.success(AuthService.stripUser(data), 'User created');
      }

      // ----- COMPETITIONS -----
      case 'createCompetition': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.createCompetition(payload);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'CREATE_COMPETITION', 'COMPETITION', 'Created competition ' + result.data.title);
        return Response.success(result.data, 'Competition created');
      }

      case 'updateCompetition': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.updateCompetition(payload.id, payload);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE_COMPETITION', 'COMPETITION', 'Updated competition ' + payload.id);
        return Response.success(result.data, 'Competition updated');
      }

      case 'deleteCompetition': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.deleteCompetition(payload.id);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'DELETE_COMPETITION', 'COMPETITION', 'Deleted competition ' + payload.id);
        return Response.success({ ok: true }, 'Competition deleted');
      }

      case 'startCompetition': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.startCompetition(payload.id);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'START_COMPETITION', 'COMPETITION', 'Started competition ' + result.data.title);
        return Response.success(result.data, 'Competition started');
      }

      case 'finishCompetition': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.finishCompetition(payload.id);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'FINISH_COMPETITION', 'COMPETITION', 'Finished competition ' + result.data.title);
        return Response.success(result.data, 'Competition finished');
      }

      case 'cancelCompetition': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionService.cancelCompetition(payload.id);
        if (!result.success) return Response.error(result.message, 'CompetitionError');
        ActivityService.log(auth.user.id, auth.user.name, 'CANCEL_COMPETITION', 'COMPETITION', 'Cancelled competition ' + payload.id);
        return Response.success(result.data, 'Competition cancelled');
      }

      // ----- COMPETITION PARTICIPANTS -----
      case 'addCompetitionParticipant': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionParticipantService.addParticipant(payload.competitionId, payload.participantId);
        if (!result.success) return Response.error(result.message, 'ParticipantError');
        ActivityService.log(auth.user.id, auth.user.name, 'ADD_PARTICIPANT', 'COMPETITION', 'Added participant to competition');
        return Response.success(result.data, 'Participant added');
      }

      case 'removeCompetitionParticipant': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionParticipantService.removeParticipant(payload.competitionId, payload.participantId);
        if (!result.success) return Response.error(result.message, 'ParticipantError');
        ActivityService.log(auth.user.id, auth.user.name, 'REMOVE_PARTICIPANT', 'COMPETITION', 'Removed participant from competition');
        return Response.success({ ok: true }, 'Participant removed');
      }

      // ----- TEAMS -----
      case 'createTeam': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.createTeam(payload.competitionId, payload.name, payload.department, payload.captainParticipantId);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'CREATE_TEAM', 'COMPETITION', 'Created team ' + result.data.name);
        return Response.success(result.data, 'Team created');
      }

      case 'updateTeam': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.updateTeam(payload.id, payload);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE_TEAM', 'COMPETITION', 'Updated team ' + payload.id);
        return Response.success(result.data, 'Team updated');
      }

      case 'deleteTeam': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.deleteTeam(payload.id);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'DELETE_TEAM', 'COMPETITION', 'Deleted team ' + payload.id);
        return Response.success({ ok: true }, 'Team deleted');
      }

      case 'addTeamMember': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.addMember(payload.teamId, payload.participantId);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'ADD_TEAM_MEMBER', 'COMPETITION', 'Added team member');
        return Response.success(result.data, 'Member added');
      }

      case 'removeTeamMember': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.removeMember(payload.teamId, payload.participantId);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'REMOVE_TEAM_MEMBER', 'COMPETITION', 'Removed team member');
        return Response.success({ ok: true }, 'Member removed');
      }

      case 'setTeamCaptain': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.setCaptain(payload.teamId, payload.participantId);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE_TEAM', 'COMPETITION', 'Set team captain');
        return Response.success(result.data, 'Captain updated');
      }

      case 'disqualifyTeam': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = TeamService.disqualifyTeam(payload.id);
        if (!result.success) return Response.error(result.message, 'TeamError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE_TEAM', 'COMPETITION', 'Disqualified team ' + payload.id);
        return Response.success(result.data, 'Team disqualified');
      }

      // ----- SCORING -----
      case 'saveScore': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = ScoringService.saveScore(payload);
        if (!result.success) return Response.error(result.message, 'ScoringError');
        ActivityService.log(auth.user.id, auth.user.name, 'SAVE_SCORE', 'SCORING', 'Saved score for competition ' + payload.competitionId);
        return Response.success(result.data, 'Score saved');
      }

      case 'updateScore': {
        const auth = authorize(e, 'OPERATOR');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        payload.changedBy = auth.user.name;
        const result = ScoringService.updateScore(payload.id, payload, payload.reason);
        if (!result.success) return Response.error(result.message, 'ScoringError');
        ActivityService.log(auth.user.id, auth.user.name, 'UPDATE_SCORE', 'SCORING', 'Updated score ' + payload.id);
        return Response.success(result.data, 'Score updated');
      }

      // ----- NOMINATIONS -----
      case 'createNomination': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        payload.createdBy = auth.user.name;
        const result = NominationService.createNomination(payload);
        if (!result.success) return Response.error(result.message, 'NominationError');
        ActivityService.log(auth.user.id, auth.user.name, 'CREATE_NOMINATION', 'NOMINATION', 'Created nomination');
        return Response.success(result.data, 'Nomination created');
      }

      case 'updateNomination': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = NominationService.updateNomination(payload.id, payload);
        if (!result.success) return Response.error(result.message, 'NominationError');
        return Response.success(result.data, 'Nomination updated');
      }

      case 'confirmNomination': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = NominationService.confirmNomination(payload.id, auth.user.name);
        if (!result.success) return Response.error(result.message, 'NominationError');
        ActivityService.log(auth.user.id, auth.user.name, 'CONFIRM_NOMINATION', 'NOMINATION', 'Confirmed nomination ' + payload.id);
        return Response.success(result.data, 'Nomination confirmed');
      }

      case 'rejectNomination': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = NominationService.rejectNomination(payload.id);
        if (!result.success) return Response.error(result.message, 'NominationError');
        ActivityService.log(auth.user.id, auth.user.name, 'REJECT_NOMINATION', 'NOMINATION', 'Rejected nomination ' + payload.id);
        return Response.success(result.data, 'Nomination rejected');
      }

      // ----- COMPETITION WINNERS -----
      case 'confirmCompetitionWinner': {
        const auth = authorize(e, 'ADMIN');
        if (auth.error) return Response.error(auth.error, 'AuthError');
        const result = CompetitionWinnerService.confirmWinner(
          payload.competitionId,
          payload.participantId,
          payload.teamId,
          payload.position,
          payload.category,
          payload.score,
          auth.user.name
        );
        if (!result.success) return Response.error(result.message, 'WinnerError');
        ActivityService.log(auth.user.id, auth.user.name, 'CONFIRM_WINNER', 'WINNER', 'Confirmed competition winner');
        return Response.success(result.data, 'Winner confirmed');
      }

      default:
        return Response.error('Invalid action', 'NotFound', 404);
    }
  } catch (error) {
    return Response.error(error.message || 'Internal server error', 'ServerError', 500);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .addHeader('Access-Control-Max-Age', '86400');
}
