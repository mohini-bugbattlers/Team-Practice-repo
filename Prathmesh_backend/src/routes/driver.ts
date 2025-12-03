import express from 'express';
import { DriverDashboardController } from '../controllers/driver/DriverDashboardController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All driver routes require authentication and driver role
router.use(authenticateToken);
router.use(requireRole(['driver']));

// GET /api/driver/dashboard
router.get('/dashboard', DriverDashboardController.getDriverDashboard);

// GET /api/driver/trips
router.get('/trips', DriverDashboardController.getDriverTrips);

// GET /api/driver/payments
router.get('/payments', DriverDashboardController.getDriverPayments);

export default router;
