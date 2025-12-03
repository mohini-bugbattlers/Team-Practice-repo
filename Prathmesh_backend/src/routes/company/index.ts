import { Router } from 'express';
import { CompanyController } from '../../controllers/company/CompanyController';
import { CompanyTransportRequestController } from '../../controllers/company/CompanyTransportRequestController';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware to all company routes
router.use(authenticateToken);

// Company Dashboard
router.get('/dashboard', CompanyController.getCompanyDashboard);

// Company Trips - filtered by company ID
router.get('/trips', CompanyController.getCompanyTrips);

// Company Payments - filtered by company ID
router.get('/payments', CompanyController.getCompanyPayments);

// Company Invoices - filtered by company ID
router.get('/invoices', CompanyController.getCompanyInvoices);

// Transport Requests (Company creates requests)
router.post('/transport-requests', requireRole(['company']), CompanyTransportRequestController.createTransportRequest);
router.get('/transport-requests', requireRole(['company']), CompanyTransportRequestController.getCompanyTransportRequests);

// Admin routes for transport requests
router.get('/admin/transport-requests', requireRole(['admin']), CompanyTransportRequestController.getAllTransportRequests);
router.get('/admin/transport-requests/:id', requireRole(['admin']), CompanyTransportRequestController.getTransportRequestById);
router.put('/admin/transport-requests/:id/status', requireRole(['admin']), CompanyTransportRequestController.updateTransportRequestStatus);
router.get('/admin/transport-requests-stats', requireRole(['admin']), CompanyTransportRequestController.getTransportRequestStats);

export default router;
