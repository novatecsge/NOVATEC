const { successResponse } = require('../../shared/responses/apiResponse');
const reservationsService = require('./reservations.service');

const createReservation = async (req, res, next) => {
  try {
    const result = await reservationsService.createReservation(req.auth.userId, req.body);
    return successResponse(res, 'Reserva creada correctamente', result, 201);
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const result = await reservationsService.getMyReservations(req.auth.userId);
    return successResponse(res, 'Reservas obtenidas correctamente', result);
  } catch (error) {
    next(error);
  }
};

const getPendingReservations = async (_req, res, next) => {
  try {
    const result = await reservationsService.getPendingReservations();
    return successResponse(res, 'Reservas pendientes obtenidas correctamente', result);
  } catch (error) {
    next(error);
  }
};

const approveReservation = async (req, res, next) => {
  try {
    const result = await reservationsService.approveReservation(req.auth.userId, req.params.id);
    return successResponse(res, 'Reserva aprobada correctamente', result);
  } catch (error) {
    next(error);
  }
};

const rejectReservation = async (req, res, next) => {
  try {
    const result = await reservationsService.rejectReservation(
      req.auth.userId,
      req.params.id,
      req.body.reason
    );
    return successResponse(res, 'Reserva rechazada correctamente', result);
  } catch (error) {
    next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const result = await reservationsService.cancelReservation(
      req.auth.userId,
      req.params.id,
      req.auth.userId
    );
    return successResponse(res, 'Reserva cancelada correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getPendingReservations,
  approveReservation,
  rejectReservation,
  cancelReservation
};