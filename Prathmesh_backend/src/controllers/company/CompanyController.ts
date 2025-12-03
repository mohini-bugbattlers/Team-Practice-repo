import { Request, Response } from 'express';
import { CompanyService } from '../../services/company/CompanyService';
import { ApiResponse } from '../../interfaces';

const companyService = new CompanyService();

export class CompanyController {
  static async getCompanyTrips(req: Request, res: Response) {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await companyService.getCompanyTrips(companyId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error fetching company trips:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getCompanyPayments(req: Request, res: Response) {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await companyService.getCompanyPayments(companyId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error fetching company payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getCompanyInvoices(req: Request, res: Response) {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await companyService.getCompanyInvoices(companyId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error fetching company invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getCompanyDashboard(req: Request, res: Response) {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await companyService.getCompanyDashboardStats(companyId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
