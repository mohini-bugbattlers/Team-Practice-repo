import express from 'express';
import { DriverController } from '../controllers/DriverController';

const router = express.Router();

// GET /api/drivers
router.get('/', DriverController.getAllDrivers);

// GET /api/drivers/:id
router.get('/:id', DriverController.getDriverById);

// POST /api/drivers
router.post('/', DriverController.createDriver);

// PUT /api/drivers/:id
router.put('/:id', DriverController.updateDriver);

// DELETE /api/drivers/:id
router.delete('/:id', DriverController.deleteDriver);

// GET /api/drivers/stats
router.get('/stats', DriverController.getDriverStats);

export default router;
