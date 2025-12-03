import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { ApiResponse } from '../interfaces';

const paymentService = new PaymentService();

export class PaymentController {
  static async getAllPayments(req: Request, res: Response) {
    const { status, company_id, vehicle_owner_id, trip_id } = req.query;

    const result = await paymentService.getAllPayments({
      status: status as string,
      company_id: company_id ? parseInt(company_id as string) : undefined,
      vehicle_owner_id: vehicle_owner_id ? parseInt(vehicle_owner_id as string) : undefined,
      trip_id: trip_id ? parseInt(trip_id as string) : undefined
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
        message: result.message
      } as ApiResponse);
    }
  }

  static async getPaymentById(req: Request, res: Response) {
    const { id } = req.params;

    const result = await paymentService.getPaymentById(id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      } as ApiResponse);
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      } as ApiResponse);
    }
  }

  static async createPayment(req: Request, res: Response) {
    const result = await paymentService.createPayment(req.body);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      } as ApiResponse);
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const result = await paymentService.updatePaymentStatus(
      id,
      status,
      transactionId
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      } as ApiResponse);
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      } as ApiResponse);
    }
  }

  static async deletePayment(req: Request, res: Response) {
    const { id } = req.params;

    const result = await paymentService.deletePayment(parseInt(id));

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      } as ApiResponse);
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      } as ApiResponse);
    }
  }

  static async getPaymentStats(req: Request, res: Response) {
    const result = await paymentService.getPaymentStats();

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
  }
}
