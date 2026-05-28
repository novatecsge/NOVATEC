const AppError = require('../../shared/errors/AppError');
const { withTransaction } = require('../../shared/utils/transaction');
const { getIo } = require('../../config/socket');
const reservationsRepository = require('./reservations.repository');

const mapReservation = (reservation) => ({
  id: reservation.id,
  userId: reservation.user_id,
  vehicleId: reservation.vehicle_id,
  parkingSpaceId: reservation.parking_space_id,
  requestedStartAt: reservation.requested_start_at,
  requestedEndAt: reservation.requested_end_at,
  status: reservation.status,
  rejectionReason: reservation.rejection_reason,
  approvedBy: reservation.approved_by,
  approvedAt: reservation.approved_at,
  cancelledAt: reservation.cancelled_at,
  completedAt: reservation.completed_at,
  createdAt: reservation.created_at,
  updatedAt: reservation.updated_at,
  spaceCode: reservation.space_code,
  spaceType: reservation.space_type,
  plate: reservation.plate,
  vehicleType: reservation.vehicle_type,
  fullName: reservation.full_name,
  email: reservation.email
});

const createReservation = async (userId, payload) => {
  return withTransaction(async (client) => {
    const user = await reservationsRepository.lockUserRow(userId, client);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    if (!user.is_active || user.is_disabled) {
      throw new AppError('Usuario no autorizado para reservar', 403, 'USER_INACTIVE');
    }

    const vehicle = await reservationsRepository.findVehicleByIdAndUserId(
      payload.vehicleId,
      userId,
      client
    );

    if (!vehicle) {
      throw new AppError('Vehículo no encontrado', 404, 'VEHICLE_NOT_FOUND');
    }

    if (!vehicle.is_active || vehicle.deleted_at) {
      throw new AppError('Vehículo inactivo', 400, 'VEHICLE_INACTIVE');
    }

    const userConflict = await reservationsRepository.findConflictingReservationByUser({
      userId,
      requestedStartAt: payload.requestedStartAt,
      requestedEndAt: payload.requestedEndAt
    }, client);

    if (userConflict) {
      throw new AppError(
        'Ya tienes una reserva activa o pendiente en ese horario',
        409,
        'USER_RESERVATION_CONFLICT'
      );
    }

    const space = await reservationsRepository.findAvailableSpaceForReservation({
      vehicleType: vehicle.vehicle_type,
      hasDisability: user.has_disability,
      requestedStartAt: payload.requestedStartAt,
      requestedEndAt: payload.requestedEndAt
    }, client);

    if (!space) {
      throw new AppError(
        'No hay espacios disponibles para el horario solicitado',
        409,
        'NO_AVAILABLE_SPACES'
      );
    }

    const reservation = await reservationsRepository.createReservation({
      userId,
      vehicleId: vehicle.id,
      parkingSpaceId: space.id,
      requestedStartAt: payload.requestedStartAt,
      requestedEndAt: payload.requestedEndAt,
      status: 'PENDING'
    }, client);

    await reservationsRepository.createReservationStatusHistory({
      reservationId: reservation.id,
      oldStatus: null,
      newStatus: 'PENDING',
      changedBy: userId,
      changeReason: null
    }, client);

    await reservationsRepository.createAuditLog({
      actorUserId: userId,
      action: 'CREATE_RESERVATION',
      moduleName: 'RESERVATIONS',
      entityType: 'RESERVATION',
      entityId: reservation.id,
      oldData: {},
      newData: reservation
    }, client);

    const io = getIo();
    io.to('admin').emit('reservation:new', {
      reservationId: reservation.id,
      userId,
      parkingSpaceId: space.id,
      status: reservation.status
    });

    io.to(`users:${userId}`).emit('reservation:new', {
      reservationId: reservation.id,
      userId,
      parkingSpaceId: space.id,
      status: reservation.status
    });

    return {
      reservation: mapReservation({
        ...reservation,
        space_code: space.code,
        space_type: space.space_type,
        plate: vehicle.plate,
        vehicle_type: vehicle.vehicle_type
      })
    };
  });
};

const getMyReservations = async (userId) => {
  const reservations = await reservationsRepository.listReservationsByUserId(userId);
  return {
    reservations: reservations.map(mapReservation)
  };
};

const getPendingReservations = async () => {
  const reservations = await reservationsRepository.listPendingReservations();
  return {
    reservations: reservations.map(mapReservation)
  };
};

const approveReservation = async (actorUserId, reservationId) => {
  return withTransaction(async (client) => {
    const current = await reservationsRepository.findReservationByIdForUpdate(reservationId, client);

    if (!current) {
      throw new AppError('Reserva no encontrada', 404, 'RESERVATION_NOT_FOUND');
    }

    if (current.status !== 'PENDING') {
      throw new AppError('Solo se pueden aprobar reservas pendientes', 400, 'INVALID_RESERVATION_STATUS');
    }

    const overlap = await reservationsRepository.findOverlappingApprovedReservationForSpace({
      reservationId: current.id,
      parkingSpaceId: current.parking_space_id,
      requestedStartAt: current.requested_start_at,
      requestedEndAt: current.requested_end_at
    }, client);

    if (overlap) {
      throw new AppError(
        'No se puede aprobar: el espacio ya tiene una reserva aprobada solapada',
        409,
        'SPACE_APPROVAL_CONFLICT'
      );
    }

    const updated = await reservationsRepository.approveReservation({
      reservationId,
      approvedBy: actorUserId
    }, client);

    await reservationsRepository.createReservationStatusHistory({
      reservationId,
      oldStatus: current.status,
      newStatus: 'APPROVED',
      changedBy: actorUserId,
      changeReason: null
    }, client);

    await reservationsRepository.createAuditLog({
      actorUserId,
      action: 'APPROVE_RESERVATION',
      moduleName: 'RESERVATIONS',
      entityType: 'RESERVATION',
      entityId: reservationId,
      oldData: current,
      newData: updated
    }, client);

    const io = getIo();
    io.to('admin').emit('dashboard:update', { type: 'reservation_approved' });
    io.to(`users:${updated.user_id}`).emit('notification:new', {
      type: 'RESERVATION',
      message: 'Tu reserva fue aprobada'
    });

    return {
      reservation: mapReservation(updated)
    };
  });
};

const rejectReservation = async (actorUserId, reservationId, reason) => {
  return withTransaction(async (client) => {
    const current = await reservationsRepository.findReservationByIdForUpdate(reservationId, client);

    if (!current) {
      throw new AppError('Reserva no encontrada', 404, 'RESERVATION_NOT_FOUND');
    }

    if (current.status !== 'PENDING') {
      throw new AppError('Solo se pueden rechazar reservas pendientes', 400, 'INVALID_RESERVATION_STATUS');
    }

    const updated = await reservationsRepository.rejectReservation({
      reservationId,
      approvedBy: actorUserId,
      reason
    }, client);

    if (current.parking_space_id) {
      await reservationsRepository.updateParkingSpaceStatus(
        current.parking_space_id,
        'AVAILABLE',
        client
      );
    }

    await reservationsRepository.createReservationStatusHistory({
      reservationId,
      oldStatus: current.status,
      newStatus: 'REJECTED',
      changedBy: actorUserId,
      changeReason: reason
    }, client);

    await reservationsRepository.createAuditLog({
      actorUserId,
      action: 'REJECT_RESERVATION',
      moduleName: 'RESERVATIONS',
      entityType: 'RESERVATION',
      entityId: reservationId,
      oldData: current,
      newData: updated
    }, client);

    const io = getIo();
    if (current.parking_space_id) {
      io.to('admin').emit('space:update', {
        parkingSpaceId: current.parking_space_id,
        status: 'AVAILABLE'
      });
    }

    io.to(`users:${updated.user_id}`).emit('notification:new', {
      type: 'RESERVATION',
      message: `Tu reserva fue rechazada: ${reason}`
    });

    return {
      reservation: mapReservation(updated)
    };
  });
};

const cancelReservation = async (actorUserId, reservationId, requesterUserId) => {
  return withTransaction(async (client) => {
    const current = await reservationsRepository.findReservationByIdForUpdate(reservationId, client);

    if (!current) {
      throw new AppError('Reserva no encontrada', 404, 'RESERVATION_NOT_FOUND');
    }

    if (current.user_id !== requesterUserId) {
      throw new AppError('No puedes cancelar esta reserva', 403, 'FORBIDDEN');
    }

    if (!['PENDING', 'APPROVED'].includes(current.status)) {
      throw new AppError('La reserva no puede cancelarse', 400, 'INVALID_RESERVATION_STATUS');
    }

    const updated = await reservationsRepository.cancelReservation(reservationId, client);

    if (current.parking_space_id) {
      await reservationsRepository.updateParkingSpaceStatus(
        current.parking_space_id,
        'AVAILABLE',
        client
      );
    }

    await reservationsRepository.createReservationStatusHistory({
      reservationId,
      oldStatus: current.status,
      newStatus: 'CANCELLED',
      changedBy: actorUserId,
      changeReason: null
    }, client);

    await reservationsRepository.createAuditLog({
      actorUserId,
      action: 'CANCEL_RESERVATION',
      moduleName: 'RESERVATIONS',
      entityType: 'RESERVATION',
      entityId: reservationId,
      oldData: current,
      newData: updated
    }, client);

    const io = getIo();
    if (current.parking_space_id) {
      io.to('admin').emit('space:update', {
        parkingSpaceId: current.parking_space_id,
        status: 'AVAILABLE'
      });
    }

    return {
      reservation: mapReservation(updated)
    };
  });
};

module.exports = {
  createReservation,
  getMyReservations,
  getPendingReservations,
  approveReservation,
  rejectReservation,
  cancelReservation
};