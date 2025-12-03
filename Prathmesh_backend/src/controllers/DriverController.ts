import { Request, Response } from 'express';
import { DriverService } from '../services/DriverService';
import { ApiResponse } from '../interfaces';

const driverService = new DriverService();

export class DriverController {
  static async getAllDrivers(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await driverService.getAllDrivers({
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
      console.error('Get drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch drivers'
      } as ApiResponse);
    }
  }

  static async getDriverById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await driverService.getDriverById(parseInt(id));

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
      console.error('Get driver by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch driver'
      } as ApiResponse);
    }
  }

  static async createDriver(req: Request, res: Response) {
    try {
      const result = await driverService.createDriver(req.body);

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
      console.error('Create driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create driver'
      } as ApiResponse);
    }
  }

  static async updateDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await driverService.updateDriver(parseInt(id), req.body);

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
      console.error('Update driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update driver'
      } as ApiResponse);
    }
  }

  static async deleteDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await driverService.deleteDriver(parseInt(id));

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
      console.error('Delete driver error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete driver'
      } as ApiResponse);
    }
  }

  static async getDriverStats(req: Request, res: Response) {
    try {
      const result = await driverService.getDriverStats();

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
      console.error('Get driver stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch driver statistics'
      } as ApiResponse);
    }
  }
}
