import express from 'express';
import { TripController } from '../controllers/TripController';

const router = express.Router();

// GET /api/trips
router.get('/', TripController.getAllTrips);

// GET /api/trips/:id
router.get('/:id', TripController.getTripById);

// POST /api/trips
router.post('/', TripController.createTrip);

// PUT /api/trips/:id
router.put('/:id', TripController.updateTrip);

// PATCH /api/trips/:id/status
router.patch('/:id/status', TripController.updateTripStatus);

// DELETE /api/trips/:id
router.delete('/:id', TripController.deleteTrip);

// GET /api/trips/stats
router.get('/stats', TripController.getTripStats);

export default router;
