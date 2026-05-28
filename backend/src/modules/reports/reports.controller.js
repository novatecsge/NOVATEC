
const { successResponse } = require('../../shared/responses/apiResponse');
const reportsService = require('./reports.service');

const getReportsSummary = async (_req, res, next) => {
  try {
    const result = await reportsService.getReportsSummary();
    return successResponse(res, 'Reportes obtenidos correctamente', result);
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const result = await reportsService.getMonthlyReport({
      year: req.query.year,
      month: req.query.month
    });
    return successResponse(res, 'Reporte mensual obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportsSummary,
  getMonthlyReport
};
