import { Request, Response } from 'express';
import { VehicleOwnerService } from '../services/VehicleOwnerService';
import { ApiResponse } from '../interfaces';

const vehicleOwnerService = new VehicleOwnerService();

export class VehicleOwnerController {
  static async getAllVehicleOwners(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await vehicleOwnerService.getAllVehicleOwners({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Get vehicle owners error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle owners'
      } as ApiResponse);
    }
  }

  static async getVehicleOwnerById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await vehicleOwnerService.getVehicleOwnerById(parseInt(id));

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Get vehicle owner by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle owner'
      } as ApiResponse);
    }
  }

  static async createVehicleOwner(req: Request, res: Response) {
    try {
      const result = await vehicleOwnerService.createVehicleOwner(req.body);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Create vehicle owner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create vehicle owner'
      } as ApiResponse);
    }
  }

  static async updateVehicleOwner(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await vehicleOwnerService.updateVehicleOwner(parseInt(id), req.body);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Update vehicle owner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update vehicle owner'
      } as ApiResponse);
    }
  }

  static async deleteVehicleOwner(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await vehicleOwnerService.deleteVehicleOwner(parseInt(id));

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Delete vehicle owner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete vehicle owner'
      } as ApiResponse);
    }
  }

  static async getVehicleOwnerStats(req: Request, res: Response) {
    try {
      const result = await vehicleOwnerService.getVehicleOwnerStats();

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Get vehicle owner stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle owner statistics'
      } as ApiResponse);
    }
  }
}
