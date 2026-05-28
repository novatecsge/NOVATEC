const dashboardRepository = require('./dashboard.repository');

const getDashboardSummary = async () => {
  const [summary, today, peakHours, usageByUser, hourlyFlow, dailyFlow, topFlowDays] = await Promise.all([
    dashboardRepository.getSummary(),
    dashboardRepository.getTodayAccessMetrics(),
    dashboardRepository.getPeakHours(),
    dashboardRepository.getUsageByUser(),
    dashboardRepository.getHourlyFlow(),
    dashboardRepository.getDailyFlow(),
    dashboardRepository.getTopFlowDays()
  ]);

  return {
    summary,
    today,
    peakHours,
    usageByUser,
    hourlyFlow,
    dailyFlow,
    topFlowDays
  };
};

module.exports = {
  getDashboardSummary
};
