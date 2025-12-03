import { Request, Response } from 'express';
import { DriverService } from '../../services/driver/DriverService';
import { ApiResponse } from '../../interfaces';

const driverService = new DriverService();

export class DriverDashboardController {
  static async getDriverTrips(req: Request, res: Response) {
    try {
      const driverId = (req as any).user?.id;

      if (!driverId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await driverService.getDriverTrips(driverId);

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
      console.error('Error fetching driver trips:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getDriverPayments(req: Request, res: Response) {
    try {
      const driverId = (req as any).user?.id;

      if (!driverId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await driverService.getDriverPayments(driverId);

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
      console.error('Error fetching driver payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getDriverDashboard(req: Request, res: Response) {
    try {
      const driverId = (req as any).user?.id;

      if (!driverId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await driverService.getDriverDashboardStats(driverId);

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
      console.error('Error fetching driver dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
