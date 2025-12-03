import { Request, Response } from 'express';
import { VehicleOwnerService } from '../../services/vehicleOwner/VehicleOwnerService';
import { ApiResponse } from '../../interfaces';

const vehicleOwnerService = new VehicleOwnerService();

export class VehicleOwnerDashboardController {
  static async getVehicleOwnerTrips(req: Request, res: Response) {
    try {
      const vehicleOwnerId = (req as any).user?.id;

      if (!vehicleOwnerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await vehicleOwnerService.getVehicleOwnerTrips(vehicleOwnerId);

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
      console.error('Error fetching vehicle owner trips:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getVehicleOwnerPayments(req: Request, res: Response) {
    try {
      const vehicleOwnerId = (req as any).user?.id;

      if (!vehicleOwnerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await vehicleOwnerService.getVehicleOwnerPayments(vehicleOwnerId);

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
      console.error('Error fetching vehicle owner payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getVehicleOwnerInvoices(req: Request, res: Response) {
    try {
      const vehicleOwnerId = (req as any).user?.id;

      if (!vehicleOwnerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await vehicleOwnerService.getVehicleOwnerInvoices(vehicleOwnerId);

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
      console.error('Error fetching vehicle owner invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getVehicleOwnerDashboard(req: Request, res: Response) {
    try {
      const vehicleOwnerId = (req as any).user?.id;

      if (!vehicleOwnerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await vehicleOwnerService.getVehicleOwnerDashboardStats(vehicleOwnerId);

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
      console.error('Error fetching vehicle owner dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
