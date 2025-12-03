import express from 'express';
import { ManagerController } from '../controllers/manager/ManagerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All manager routes require authentication and manager role
router.use(authenticateToken);
router.use(requireRole(['manager']));

// GET /api/manager/dashboard
router.get('/dashboard', ManagerController.getManagerDashboard);

// GET /api/manager/trips
router.get('/trips', ManagerController.getManagerTrips);

// GET /api/manager/payments
router.get('/payments', ManagerController.getManagerPayments);

// GET /api/manager/invoices
router.get('/invoices', ManagerController.getManagerInvoices);

export default router;
