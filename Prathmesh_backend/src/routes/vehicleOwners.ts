import express from 'express';
import { VehicleOwnerController } from '../controllers/VehicleOwnerController';

const router = express.Router();

// GET /api/vehicle-owners
router.get('/', VehicleOwnerController.getAllVehicleOwners);

// GET /api/vehicle-owners/:id
router.get('/:id', VehicleOwnerController.getVehicleOwnerById);

// POST /api/vehicle-owners
router.post('/', VehicleOwnerController.createVehicleOwner);

// PUT /api/vehicle-owners/:id
router.put('/:id', VehicleOwnerController.updateVehicleOwner);

// DELETE /api/vehicle-owners/:id
router.delete('/:id', VehicleOwnerController.deleteVehicleOwner);

// GET /api/vehicle-owners/stats
router.get('/stats', VehicleOwnerController.getVehicleOwnerStats);

export default router;
