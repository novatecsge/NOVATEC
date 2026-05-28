const crypto = require('crypto');
const QRCode = require('qrcode');
const AppError = require('../../shared/errors/AppError');
const { withTransaction } = require('../../shared/utils/transaction');
const { signQrToken } = require('../../shared/utils/jwt');
const qrRepository = require('./qr.repository');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getQrExpirationDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};

const isQrReusable = (qr) => {
  if (!qr) return false;
  if (!qr.is_active) return false;
  if (qr.is_revoked) return false;
  if (!qr.qr_token_value) return false;
  if (new Date(qr.expires_at) <= new Date()) return false;
  return true;
};

const mapQr = (qr) => ({
  id: qr.id,
  vehicleId: qr.vehicle_id,
  userId: qr.user_id,
  qrJti: qr.qr_jti,
  issuedAt: qr.issued_at,
  expiresAt: qr.expires_at,
  lastUsedAt: qr.last_used_at,
  isRevoked: qr.is_revoked,
  isActive: qr.is_active,
  revokedAt: qr.revoked_at,
  revokedReason: qr.revoked_reason
});

const buildQrResponse = async (qrRecord) => {
  const image = await QRCode.toDataURL(qrRecord.qr_token_value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320
  });

  return {
    qr: mapQr(qrRecord),
    token: qrRecord.qr_token_value,
    image
  };
};

const createFreshQr = async ({ userId, vehicle, currentActiveQr, client }) => {
  if (currentActiveQr) {
    await qrRepository.deactivateActiveQrByVehicleId(
      vehicle.id,
      'ROTATION',
      client
    );
  }

  const qrId = crypto.randomUUID();
  const qrJti = crypto.randomUUID();
  const expiresAt = getQrExpirationDate();

  const payload = {
    vehicleId: vehicle.id,
    userId,
    qrId,
    qrJti,
    type: 'access_qr'
  };

  const signedQrToken = signQrToken(payload);
  const qrTokenHash = hashToken(signedQrToken);

  const finalQr = await qrRepository.createQr(
    {
      id: qrId,
      qrJti,
      vehicleId: vehicle.id,
      userId,
      qrTokenHash,
      qrTokenValue: signedQrToken,
      expiresAt
    },
    client
  );

  await qrRepository.createAuditLog(
    {
      actorUserId: userId,
      action: 'GENERATE_QR',
      moduleName: 'QR',
      entityType: 'QR',
      entityId: finalQr.id,
      oldData: currentActiveQr || {},
      newData: {
        qrId: finalQr.id,
        qrJti: finalQr.qr_jti,
        vehicleId: vehicle.id,
        expiresAt: finalQr.expires_at
      }
    },
    client
  );

  return finalQr;
};

const generateOrRotateQr = async (userId, vehicleId) => {
  return withTransaction(async (client) => {
    const vehicle = await qrRepository.findVehicleByIdAndUser(
      vehicleId,
      userId,
      client
    );

    if (!vehicle) {
      throw new AppError('Vehículo no encontrado', 404, 'VEHICLE_NOT_FOUND');
    }

    if (!vehicle.is_active) {
      throw new AppError('El vehículo está inactivo', 400, 'VEHICLE_INACTIVE');
    }

    const currentActiveQr = await qrRepository.findActiveQrByVehicleId(
      vehicleId,
      client
    );

    // Reutiliza el mismo QR durante todo el mes
    if (isQrReusable(currentActiveQr)) {
      return buildQrResponse(currentActiveQr);
    }

    const freshQr = await createFreshQr({
      userId,
      vehicle,
      currentActiveQr,
      client
    });

    return buildQrResponse(freshQr);
  });
};

const getMyVehicleQr = async (userId, vehicleId) => {
  const vehicle = await qrRepository.findVehicleByIdAndUser(
    vehicleId,
    userId
  );

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404, 'VEHICLE_NOT_FOUND');
  }

  const activeQr = await qrRepository.findActiveQrByVehicleId(vehicleId);

  if (!activeQr || !isQrReusable(activeQr)) {
    throw new AppError(
      'Este vehículo aún no tiene un QR activo vigente. Genera o regenera el QR.',
      404,
      'QR_NOT_FOUND'
    );
  }

  return buildQrResponse(activeQr);
};

const revokeQr = async (
  actorUserId,
  qrId,
  reason = 'MANUAL_REVOCATION'
) => {
  return withTransaction(async (client) => {
    const qr = await qrRepository.findQrById(qrId, client);

    if (!qr) {
      throw new AppError('QR no encontrado', 404, 'QR_NOT_FOUND');
    }

    const revoked = await qrRepository.revokeQrById(qrId, reason, client);

    await qrRepository.createAuditLog(
      {
        actorUserId,
        action: 'REVOKE_QR',
        moduleName: 'QR',
        entityType: 'QR',
        entityId: qrId,
        oldData: qr,
        newData: revoked
      },
      client
    );

    return {
      qr: mapQr(revoked)
    };
  });
};

module.exports = {
  generateOrRotateQr,
  getMyVehicleQr,
  revokeQr
};