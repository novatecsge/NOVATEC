const crypto = require('crypto');
const AppError = require('../../shared/errors/AppError');
const { verifyQrToken } = require('../../shared/utils/jwt');
const { withTransaction } = require('../../shared/utils/transaction');
const accessRepository = require('./access.repository');
const { getIo } = require('../../config/socket');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const mapAccess = (accessLog) => ({
  id: accessLog.id,
  userId: accessLog.user_id,
  vehicleId: accessLog.vehicle_id,
  parkingSpaceId: accessLog.parking_space_id,
  reservationId: accessLog.reservation_id,
  accessType: accessLog.access_type,
  accessTime: accessLog.access_time,
  gate: accessLog.gate,
  entryId: accessLog.entry_id,
  scanResult: accessLog.scan_result
});

const emitAccessEvent = (eventName, accessLog, userId) => {
  const io = getIo();
  const payload = mapAccess(accessLog);

  io.to('admin').emit(eventName, payload);
  io.to('guards').emit(eventName, payload);
  io.to(`users:${userId}`).emit(eventName, payload);
};

const resolveParkingAssignment = async ({ vehicle, user, now, client }) => {
  const activeReservation =
    await accessRepository.findActiveApprovedReservationForVehicleAtTime(
      {
        vehicleId: vehicle.id,
        accessTime: now
      },
      client
    );

  if (activeReservation?.parking_space_id) {
    return {
      parkingSpaceId: activeReservation.parking_space_id,
      reservationId: activeReservation.id,
      assignmentSource: 'RESERVATION'
    };
  }

  const autoAssignedSpace = await accessRepository.findBestAvailableSpaceForVehicle(
    {
      vehicleType: vehicle.vehicle_type,
      hasDisability: Boolean(user.has_disability)
    },
    client
  );

  if (!autoAssignedSpace) {
    throw new AppError(
      'No hay espacios disponibles compatibles para este vehículo',
      409,
      'NO_AVAILABLE_SPACE'
    );
  }

  return {
    parkingSpaceId: autoAssignedSpace.id,
    reservationId: activeReservation?.id || null,
    assignmentSource: 'AUTO'
  };
};

const scanQr = async ({ qrToken, gate = 'MAIN_GATE', actorUserId }) => {
  let decoded;

  try {
    decoded = verifyQrToken(qrToken);
  } catch (_error) {
    throw new AppError('QR inválido o expirado', 401, 'INVALID_QR');
  }

  return withTransaction(async (client) => {
    const qr = await accessRepository.findQrByIdForUpdate(decoded.qrId, client);

    if (!qr) {
      throw new AppError('QR no encontrado', 404, 'QR_NOT_FOUND');
    }

    if (!qr.is_active || qr.is_revoked) {
      throw new AppError('QR revocado o inactivo', 403, 'QR_REVOKED');
    }

    if (new Date(qr.expires_at) < new Date()) {
      throw new AppError('QR expirado', 403, 'QR_EXPIRED');
    }

    const incomingHash = hashToken(qrToken);
    if (incomingHash !== qr.qr_token_hash) {
      throw new AppError('QR manipulado o no válido', 403, 'QR_TAMPERED');
    }

    const user = await accessRepository.findUserByIdForAccess(
      decoded.userId,
      client
    );

    if (!user || !user.is_active || user.is_disabled) {
      throw new AppError('Usuario no autorizado', 403, 'USER_INACTIVE');
    }

    const vehicle = await accessRepository.findVehicleByIdForAccess(
      decoded.vehicleId,
      client
    );

    if (!vehicle || vehicle.deleted_at || !vehicle.is_active) {
      throw new AppError(
        'Vehículo no disponible para acceso',
        403,
        'VEHICLE_INACTIVE'
      );
    }

    const openEntry = await accessRepository.findLatestOpenEntryForUpdate(
      decoded.userId,
      decoded.vehicleId,
      client
    );

    const now = new Date();
    let accessLog;

    // SALIDA
    if (openEntry) {
      accessLog = await accessRepository.createAccessLog(
        {
          userId: decoded.userId,
          vehicleId: decoded.vehicleId,
          qrId: qr.id,
          entryId: openEntry.id,
          parkingSpaceId: openEntry.parking_space_id || null,
          reservationId: openEntry.reservation_id || null,
          accessType: 'EXIT',
          accessTime: now,
          scanTokenJti: null,
          scanResult: 'ALLOWED',
          gate
        },
        client
      );

      await accessRepository.updateQrLastUse(qr.id, 'EXIT', now, client);

      if (openEntry.parking_space_id) {
        await accessRepository.updateParkingSpaceStatus(
          openEntry.parking_space_id,
          'AVAILABLE',
          client
        );
      }

      if (openEntry.reservation_id) {
        await accessRepository.completeReservation(openEntry.reservation_id, client);
      }

      await accessRepository.createAuditLog(
        {
          actorUserId,
          action: 'ACCESS_EXIT',
          moduleName: 'ACCESS',
          entityType: 'ACCESS_LOG',
          entityId: accessLog.id,
          oldData: {},
          newData: accessLog
        },
        client
      );

      emitAccessEvent('access:exit', accessLog, decoded.userId);

      return {
        access: mapAccess(accessLog)
      };
    }

    // ENTRADA
    const assignment = await resolveParkingAssignment({
      vehicle,
      user,
      now,
      client
    });

    await accessRepository.updateParkingSpaceStatus(
      assignment.parkingSpaceId,
      'OCCUPIED',
      client
    );

    accessLog = await accessRepository.createAccessLog(
      {
        userId: decoded.userId,
        vehicleId: decoded.vehicleId,
        qrId: qr.id,
        entryId: null,
        parkingSpaceId: assignment.parkingSpaceId,
        reservationId: assignment.reservationId,
        accessType: 'ENTRY',
        accessTime: now,
        scanTokenJti: null,
        scanResult: 'ALLOWED',
        gate
      },
      client
    );

    await accessRepository.updateQrLastUse(qr.id, 'ENTRY', now, client);

    await accessRepository.createAuditLog(
      {
        actorUserId,
        action: 'ACCESS_ENTRY',
        moduleName: 'ACCESS',
        entityType: 'ACCESS_LOG',
        entityId: accessLog.id,
        oldData: {},
        newData: {
          ...accessLog,
          assignmentSource: assignment.assignmentSource
        }
      },
      client
    );

    emitAccessEvent('access:entry', accessLog, decoded.userId);

    return {
      access: mapAccess(accessLog)
    };
  });
};

module.exports = {
  scanQr
};