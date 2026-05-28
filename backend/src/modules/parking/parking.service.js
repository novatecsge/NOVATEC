const parkingRepository = require('./parking.repository');

const mapSpace = (space) => ({
  id: space.id,
  code: space.code,
  number: space.number,
  spaceType: space.space_type,
  status: space.effective_status,
  reservationId: space.reservation_id || null,
  userId: space.user_id || null,
  vehicleId: space.vehicle_id || null,
  plate: space.plate || null,
  brand: space.brand || null,
  model: space.model || null,
  assignmentStatus: space.assignment_status || 'UNASSIGNED'
});

const getParkingMap = async () => {
  const spaces = await parkingRepository.getParkingMap();
  return {
    spaces: spaces.map(mapSpace)
  };
};

const getAllSpaces = async () => getParkingMap();

module.exports = {
  getAllSpaces,
  getParkingMap
};
