/**
 * Competition dashboard aggregation service.
 */
const CompetitionDashboardService = {
  getStatistics: () => {
    const competitions = CompetitionService.getAllCompetitions();
    const scores = Utils.readRows(ScoringService.getSheet());
    const nominations = Utils.readRows(NominationService.getSheet());
    const winners = Utils.readRows(CompetitionWinnerService.getSheet());
    return {
      totalCompetitions: competitions.length,
      runningCompetitions: competitions.filter((c) => c.status === 'RUNNING').length,
      finishedCompetitions: competitions.filter((c) => c.status === 'FINISHED').length,
      totalScores: scores.length,
      totalNominations: nominations.length,
      competitionWinners: winners.length,
    };
  },

  getRecentActivity: () => {
    const logs = ActivityService.getLogs(50);
    return logs
      .filter((l) => l.module === 'COMPETITION' || l.module === 'SCORING' || l.module === 'NOMINATION' || l.module === 'WINNER')
      .map((l) => ({ type: 'LOG', label: l.description || l.action, timestamp: l.timestamp }))
      .slice(0, 20);
  },
};
