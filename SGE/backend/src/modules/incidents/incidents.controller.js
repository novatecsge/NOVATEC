const { successResponse } = require('../../shared/responses/apiResponse');
const incidentsService = require('./incidents.service');

const createIncident = async (req, res, next) => {
  try {
    const result = await incidentsService.createIncident(req.auth.userId, req.body);
    return successResponse(res, 'Incidencia creada correctamente', result, 201);
  } catch (error) {
    next(error);
  }
};

const listIncidents = async (_req, res, next) => {
  try {
    const result = await incidentsService.listIncidents();
    return successResponse(res, 'Incidencias obtenidas correctamente', result);
  } catch (error) {
    next(error);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const result = await incidentsService.updateIncidentStatus(
      req.auth.userId,
      req.params.id,
      req.body.status
    );
    return successResponse(res, 'Estado de incidencia actualizado correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  listIncidents,
  updateIncidentStatus
};