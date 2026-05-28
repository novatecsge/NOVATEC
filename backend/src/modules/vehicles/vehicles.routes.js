const express = require('express');
const vehiclesController = require('./vehicles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const {
  createVehicleDto,
  updateVehicleDto,
  vehicleIdParamDto
} = require('./vehicles.dto');

const router = express.Router();

router.use(authMiddleware);

router.get('/', vehiclesController.listMyVehicles);
router.post('/', createVehicleDto, validateRequest, vehiclesController.createVehicle);
router.put('/:id', updateVehicleDto, validateRequest, vehiclesController.updateVehicle);
router.delete('/:id', vehicleIdParamDto, validateRequest, vehiclesController.deleteVehicle);

module.exports = router;