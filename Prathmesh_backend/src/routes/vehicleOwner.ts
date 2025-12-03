import express from 'express';
import { VehicleOwnerDashboardController } from '../controllers/vehicleOwner/VehicleOwnerDashboardController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All vehicle owner routes require authentication and vehicle_owner role
router.use(authenticateToken);
router.use(requireRole(['vehicle_owner']));

// GET /api/vehicleOwner/dashboard
router.get('/dashboard', VehicleOwnerDashboardController.getVehicleOwnerDashboard);

// GET /api/vehicleOwner/trips
router.get('/trips', VehicleOwnerDashboardController.getVehicleOwnerTrips);

// GET /api/vehicleOwner/payments
router.get('/payments', VehicleOwnerDashboardController.getVehicleOwnerPayments);

// GET /api/vehicleOwner/invoices
router.get('/invoices', VehicleOwnerDashboardController.getVehicleOwnerInvoices);

export default router;
