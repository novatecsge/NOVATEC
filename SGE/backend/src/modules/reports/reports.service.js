
const reportsRepository = require('./reports.repository');

const getReportsSummary = async () => {
  const [accessHistory, spaceUsage, userReservations] = await Promise.all([
    reportsRepository.getAccessHistoryReport(),
    reportsRepository.getSpaceUsageReport(),
    reportsRepository.getUserReservationReport()
  ]);

  return { accessHistory, spaceUsage, userReservations };
};

const getMonthlyReport = async ({ year, month }) => {
  const now = new Date();
  const safeYear = Number(year) || now.getFullYear();
  const safeMonth = Number(month) || now.getMonth() + 1;
  return reportsRepository.getMonthlyReport({ year: safeYear, month: safeMonth });
};

module.exports = {
  getReportsSummary,
  getMonthlyReport
};
