import express, { Request, Response } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateToken);

// GET /api/payments - Get all payments with optional filters
router.get('/', PaymentController.getAllPayments);

// GET /api/payments/stats - Get payment statistics
router.get('/stats', PaymentController.getPaymentStats);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', PaymentController.getPaymentById);

// POST /api/payments - Create new payment
router.post('/', requireRole(['admin', 'company']), PaymentController.createPayment);

// PUT /api/payments/:id/status - Update payment status
router.put('/:id/status', requireRole(['admin', 'company']), PaymentController.updatePaymentStatus);

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', requireRole(['admin']), PaymentController.deletePayment);

export default router;
