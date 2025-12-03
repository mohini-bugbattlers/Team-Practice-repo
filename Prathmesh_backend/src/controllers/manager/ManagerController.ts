import { Request, Response } from 'express';
import { ManagerService } from '../../services/manager/ManagerService';
import { ApiResponse } from '../../interfaces';

const managerService = new ManagerService();

export class ManagerController {
  static async getManagerTrips(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id;

      if (!managerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await managerService.getManagerTrips(managerId);

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
      console.error('Error fetching manager trips:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getManagerPayments(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id;

      if (!managerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await managerService.getManagerPayments(managerId);

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
      console.error('Error fetching manager payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getManagerInvoices(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id;

      if (!managerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await managerService.getManagerInvoices(managerId);

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
      console.error('Error fetching manager invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getManagerDashboard(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id;

      if (!managerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await managerService.getManagerDashboardStats(managerId);

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
      console.error('Error fetching manager dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
