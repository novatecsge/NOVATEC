const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const parkingController = require('./parking.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', parkingController.getAllSpaces);
router.get('/map', parkingController.getParkingMap);

module.exports = router;