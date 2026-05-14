const AppError = require('../../shared/errors/AppError');
const { withTransaction } = require('../../shared/utils/transaction');
const { normalizePlate } = require('../../shared/utils/plate');
const vehiclesRepository = require('./vehicles.repository');

const mapVehicle = (vehicle) => ({
  id: vehicle.id,
  userId: vehicle.user_id,
  plate: vehicle.plate,
  vehicleType: vehicle.vehicle_type,
  brand: vehicle.brand,
  model: vehicle.model,
  color: vehicle.color,
  year: vehicle.year,
  registrationStatus: vehicle.registration_status,
  isActive: vehicle.is_active,
  createdAt: vehicle.created_at,
  updatedAt: vehicle.updated_at
});

const listMyVehicles = async (userId) => {
  const vehicles = await vehiclesRepository.listVehiclesByUserId(userId);
  return { vehicles: vehicles.map(mapVehicle) };
};

const createVehicle = async (userId, payload) => {
  return withTransaction(async (client) => {
    const normalizedPlate = normalizePlate(payload.plate);

    const lockedUser = await vehiclesRepository.lockUserRow(userId, client);

    if (!lockedUser) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const totalVehicles = await vehiclesRepository.lockVehicleCountByUserId(userId, client);

    if (totalVehicles >= 3) {
      throw new AppError('Solo puedes registrar hasta 3 vehículos', 400, 'MAX_VEHICLES_REACHED');
    }

    const existingPlate = await vehiclesRepository.findVehicleByPlate(normalizedPlate, client);

    if (existingPlate) {
      throw new AppError('Ya existe un vehículo registrado con esa placa', 409, 'PLATE_ALREADY_EXISTS');
    }

    const createdVehicle = await vehiclesRepository.createVehicle({
      userId,
      plate: normalizedPlate,
      vehicleType: payload.vehicleType,
      brand: payload.brand,
      model: payload.model,
      color: payload.color,
      year: payload.year
    }, client);

    await vehiclesRepository.createAuditLog({
      actorUserId: userId,
      action: 'CREATE_VEHICLE',
      moduleName: 'VEHICLES',
      entityType: 'VEHICLE',
      entityId: createdVehicle.id,
      oldData: {},
      newData: createdVehicle
    }, client);

    return {
      vehicle: mapVehicle(createdVehicle)
    };
  });
};

const updateVehicle = async (userId, vehicleId, payload) => {
  const before = await vehiclesRepository.findVehicleByIdAndUserId(vehicleId, userId);

  if (!before) {
    throw new AppError('Vehículo no encontrado', 404, 'VEHICLE_NOT_FOUND');
  }

  const updatedVehicle = await vehiclesRepository.updateVehicle({
    vehicleId,
    userId,
    brand: payload.brand ?? null,
    model: payload.model ?? null,
    color: payload.color ?? null,
    year: payload.year ?? null
  });

  await vehiclesRepository.createAuditLog({
    actorUserId: userId,
    action: 'UPDATE_VEHICLE',
    moduleName: 'VEHICLES',
    entityType: 'VEHICLE',
    entityId: vehicleId,
    oldData: before,
    newData: updatedVehicle
  });

  return {
    vehicle: mapVehicle(updatedVehicle)
  };
};

const deleteVehicle = async (userId, vehicleId) => {
  const before = await vehiclesRepository.findVehicleByIdAndUserId(vehicleId, userId);

  if (!before) {
    throw new AppError('Vehículo no encontrado', 404, 'VEHICLE_NOT_FOUND');
  }

  const deletedVehicle = await vehiclesRepository.softDeleteVehicle(vehicleId, userId);

  await vehiclesRepository.createAuditLog({
    actorUserId: userId,
    action: 'SOFT_DELETE_VEHICLE',
    moduleName: 'VEHICLES',
    entityType: 'VEHICLE',
    entityId: vehicleId,
    oldData: before,
    newData: { isActive: false }
  });

  return {
    deleted: deletedVehicle
  };
};

module.exports = {
  listMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};