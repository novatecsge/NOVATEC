const { successResponse } = require('../../shared/responses/apiResponse');
const dashboardService = require('./dashboard.service');

const getDashboardSummary = async (_req, res, next) => {
  try {
    const result = await dashboardService.getDashboardSummary();
    return successResponse(res, 'Dashboard obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};