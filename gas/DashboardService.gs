/**
 * Dashboard aggregation service
 */
const DashboardService = {
  getStatistics: () => {
    const participantStats = ParticipantService.getStatistics();
    const prizeStats = PrizeService.statistics();
    const winnerStats = WinnerService.statistics();

    const all = ParticipantService.getAllParticipants();
    const recentCheckins = all
      .filter((p) => p.status === 'CHECKED_IN' && p.checkedInAt)
      .sort((a, b) => String(b.checkedInAt).localeCompare(String(a.checkedInAt)))
      .slice(0, 8);
    const recentParticipants = all
      .slice()
      .sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)))
      .slice(0, 8);

    return {
      totalParticipants: participantStats.totalParticipants,
      totalCheckedIn: participantStats.checkedIn,
      totalPending: participantStats.pending,
      totalPrizes: prizeStats.totalPrizes,
      availablePrizes: prizeStats.availablePrizes,
      awardedPrizes: prizeStats.awardedPrizes,
      totalWinners: winnerStats.totalWinners,
      recentParticipants,
      recentCheckins,
      recentWinners: winnerStats.recentWinners,
    };
  },

  getRecentActivity: () => {
    const logs = ActivityService.getLogs(15);
    const winners = WinnerService.getAllWinners().slice(0, 8).map((w) => ({
      type: 'WINNER',
      label: w.participantName + ' won ' + w.prizeName,
      timestamp: w.wonAt,
    }));
    const checkins = ParticipantService.getAllParticipants()
      .filter((p) => p.checkedInAt)
      .sort((a, b) => String(b.checkedInAt).localeCompare(String(a.checkedInAt)))
      .slice(0, 8)
      .map((p) => ({ type: 'CHECKIN', label: p.name + ' checked in', timestamp: p.checkedInAt }));

    const combined = [
      ...logs.map((l) => ({ type: 'LOG', label: l.description || l.action, timestamp: l.timestamp })),
      ...winners,
      ...checkins,
    ].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));

    return combined.slice(0, 20);
  },

  getSettings: () => {
    return {
      eventName: 'HUT RI KE-81',
      organization: 'Radiant Group',
      tagline: 'Merdeka! 🇮🇩',
      sessionTtlSeconds: Config.SESSION_TTL_SECONDS,
    };
  },
};