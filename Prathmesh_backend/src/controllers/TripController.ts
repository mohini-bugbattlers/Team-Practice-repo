import { Request, Response } from 'express';
import { TripService } from '../services/TripService';
import { ApiResponse } from '../interfaces';

const tripService = new TripService();

export class TripController {
  static async getAllTrips(req: Request, res: Response) {
    const { page, limit, sortBy, sortOrder, status, company_id, vehicle_owner_id, startDate, endDate } = req.query;

    const result = await tripService.getAllTrips({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      status: status as string,
      company_id: company_id ? parseInt(company_id as string) : undefined,
      vehicle_owner_id: vehicle_owner_id ? parseInt(vehicle_owner_id as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
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
  }

  static async getTripById(req: Request, res: Response) {
    const { id } = req.params;

    const result = await tripService.getTripById(parseInt(id));

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
  }

  static async createTrip(req: Request, res: Response) {
    const result = await tripService.createTrip(req.body);

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
  }

  static async updateTrip(req: Request, res: Response) {
    const { id } = req.params;

    const result = await tripService.updateTrip(parseInt(id), req.body);

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
  }

  static async updateTripStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const result = await tripService.updateTripStatus(parseInt(id), status);

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
  }

  static async deleteTrip(req: Request, res: Response) {
    const { id } = req.params;

    const result = await tripService.deleteTrip(parseInt(id));

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
  }

  static async getTripStats(req: Request, res: Response) {
    const result = await tripService.getTripStats();

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
  }
}
