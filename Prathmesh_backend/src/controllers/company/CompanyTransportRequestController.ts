import { Request, Response } from 'express';
import { CompanyTransportRequestService } from '../../services/company/CompanyTransportRequestService';
import { ApiResponse } from '../../interfaces';

const transportRequestService = new CompanyTransportRequestService();

export class CompanyTransportRequestController {
  static async createTransportRequest(req: Request, res: Response) {
    try {
      // Get company ID from authenticated user (assuming middleware sets this)
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const requestData = {
        ...req.body,
        company_id: companyId
      };

      const result = await transportRequestService.createTransportRequest(requestData);

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
    } catch (error) {
      console.error('Error creating transport request:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getCompanyTransportRequests(req: Request, res: Response) {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access'
        } as ApiResponse);
      }

      const result = await transportRequestService.getTransportRequestsByCompany(companyId);

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
      console.error('Error fetching transport requests:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getAllTransportRequests(req: Request, res: Response) {
    try {
      const { status, urgency, company_id } = req.query;

      const result = await transportRequestService.getAllTransportRequests({
        status: status as string,
        urgency: urgency as string,
        company_id: company_id ? parseInt(company_id as string) : undefined
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
    } catch (error) {
      console.error('Error fetching all transport requests:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getTransportRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await transportRequestService.getTransportRequestById(parseInt(id));

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
    } catch (error) {
      console.error('Error fetching transport request:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateTransportRequestStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminNotes, assignedTripId } = req.body;

      const result = await transportRequestService.updateTransportRequestStatus(
        parseInt(id),
        status,
        adminNotes,
        assignedTripId
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
    } catch (error) {
      console.error('Error updating transport request status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getTransportRequestStats(req: Request, res: Response) {
    try {
      const result = await transportRequestService.getTransportRequestStats();

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
      console.error('Error fetching transport request stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
