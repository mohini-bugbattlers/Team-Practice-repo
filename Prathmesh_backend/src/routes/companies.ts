import express from 'express';
import { CompanyController } from '../controllers/CompanyController';

const router = express.Router();

// GET /api/companies
router.get('/', CompanyController.getAllCompanies);

// GET /api/companies/:id
router.get('/:id', CompanyController.getCompanyById);

// POST /api/companies
router.post('/', CompanyController.createCompany);

// PUT /api/companies/:id
router.put('/:id', CompanyController.updateCompany);

// DELETE /api/companies/:id
router.delete('/:id', CompanyController.deleteCompany);


export default router;
