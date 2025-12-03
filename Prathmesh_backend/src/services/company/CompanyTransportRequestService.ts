import db from '../../config/mysql';
import { ServiceResponse } from '../../interfaces';

interface TransportRequestData {
  id?: number;
  request_number: string;
  company_id: number;
  material_type: string;
  quantity: number;
  quantity_unit: 'liters' | 'tons' | 'barrels';
  pickup_location: string;
  drop_location: string;
  preferred_date: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  special_instructions?: string;
  contact_person: string;
  contact_phone: string;
  estimated_budget?: number;
  vehicle_type?: string;
  temperature_control: boolean;
  hazardous_material: boolean;
  insurance_required: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_trip_id?: number;
  estimated_cost?: number;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
  companyName?: string;
  companyEmail?: string;
}

export class CompanyTransportRequestService {
  async createTransportRequest(requestData: {
    company_id: number;
    material_type: string;
    quantity: number;
    quantity_unit: 'liters' | 'tons' | 'barrels';
    pickup_location: string;
    drop_location: string;
    preferred_date: string;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    special_instructions?: string;
    contact_person: string;
    contact_phone: string;
    estimated_budget?: number;
    vehicle_type?: string;
    temperature_control: boolean;
    hazardous_material: boolean;
    insurance_required: boolean;
  }): Promise<ServiceResponse<TransportRequestData>> {
    try {
      // Generate unique request number
      const requestNumber = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Calculate estimated cost based on factors
      const estimatedCost = this.calculateEstimatedCost(requestData);

      // Insert transport request
      const [result] = await db.execute(
        `INSERT INTO transport_requests
         (request_number, company_id, material_type, quantity, quantity_unit, pickup_location, drop_location,
          preferred_date, urgency, special_instructions, contact_person, contact_phone, estimated_budget,
          vehicle_type, temperature_control, hazardous_material, insurance_required, status, estimated_cost, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())`,
        [
          requestNumber,
          requestData.company_id,
          requestData.material_type,
          requestData.quantity,
          requestData.quantity_unit,
          requestData.pickup_location,
          requestData.drop_location,
          requestData.preferred_date,
          requestData.urgency,
          requestData.special_instructions || null,
          requestData.contact_person,
          requestData.contact_phone,
          requestData.estimated_budget || null,
          requestData.vehicle_type || null,
          requestData.temperature_control,
          requestData.hazardous_material,
          requestData.insurance_required,
          estimatedCost
        ]
      );

      const insertId = (result as any).insertId;

      // Fetch the created request with company details
      return await this.getTransportRequestById(insertId);
    } catch (error) {
      console.error('Error creating transport request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create transport request'
      };
    }
  }

  async getTransportRequestsByCompany(companyId: number): Promise<ServiceResponse<TransportRequestData[]>> {
    try {
      const [rows] = await db.execute(
        `SELECT tr.*, c.name as companyName, c.email as companyEmail
         FROM transport_requests tr
         LEFT JOIN companies c ON tr.company_id = c.id
         WHERE tr.company_id = ?
         ORDER BY tr.created_at DESC`,
        [companyId]
      );

      const requests = rows as TransportRequestData[];

      return {
        success: true,
        data: requests,
        message: 'Transport requests retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching transport requests:', error);
      return {
        success: false,
        message: 'Failed to fetch transport requests'
      };
    }
  }

  async getAllTransportRequests(filters?: {
    status?: string;
    urgency?: string;
    company_id?: number;
  }): Promise<ServiceResponse<TransportRequestData[]>> {
    try {
      let query = `
        SELECT tr.*, c.name as companyName, c.email as companyEmail
        FROM transport_requests tr
        LEFT JOIN companies c ON tr.company_id = c.id
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.status) {
        conditions.push('tr.status = ?');
        params.push(filters.status);
      }

      if (filters?.urgency) {
        conditions.push('tr.urgency = ?');
        params.push(filters.urgency);
      }

      if (filters?.company_id) {
        conditions.push('tr.company_id = ?');
        params.push(filters.company_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY tr.created_at DESC';

      const [rows] = await db.execute(query, params);
      const requests = rows as TransportRequestData[];

      return {
        success: true,
        data: requests,
        message: 'Transport requests retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching transport requests:', error);
      return {
        success: false,
        message: 'Failed to fetch transport requests'
      };
    }
  }

  async getTransportRequestById(id: number): Promise<ServiceResponse<TransportRequestData>> {
    try {
      const [rows] = await db.execute(
        `SELECT tr.*, c.name as companyName, c.email as companyEmail
         FROM transport_requests tr
         LEFT JOIN companies c ON tr.company_id = c.id
         WHERE tr.id = ?`,
        [id]
      );

      const request = (rows as any[])[0];

      if (!request) {
        return {
          success: false,
          message: 'Transport request not found'
        };
      }

      return {
        success: true,
        data: request,
        message: 'Transport request retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching transport request:', error);
      return {
        success: false,
        message: 'Failed to fetch transport request'
      };
    }
  }

  async updateTransportRequestStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
    adminNotes?: string,
    assignedTripId?: number
  ): Promise<ServiceResponse<TransportRequestData>> {
    try {
      let query = 'UPDATE transport_requests SET status = ?, admin_notes = ?, updated_at = NOW()';
      const params: any[] = [status, adminNotes || null];

      if (assignedTripId) {
        query += ', assigned_trip_id = ?';
        params.push(assignedTripId);
      }

      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await db.execute(query, params);

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Transport request not found'
        };
      }

      // Fetch updated request
      return await this.getTransportRequestById(id);
    } catch (error) {
      console.error('Error updating transport request status:', error);
      return {
        success: false,
        message: 'Failed to update transport request status'
      };
    }
  }

  async getTransportRequestStats(): Promise<ServiceResponse<any>> {
    try {
      // Get status counts
      const [statusRows] = await db.execute(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(estimated_cost) as totalEstimatedCost
        FROM transport_requests
        GROUP BY status
      `);

      // Get overall totals
      const [totalRows] = await db.execute(`
        SELECT
          COUNT(*) as totalRequests,
          SUM(estimated_cost) as totalEstimatedValue,
          AVG(quantity) as averageQuantity
        FROM transport_requests
      `);

      // Get urgency breakdown
      const [urgencyRows] = await db.execute(`
        SELECT
          urgency,
          COUNT(*) as count
        FROM transport_requests
        GROUP BY urgency
      `);

      const stats = statusRows as any[];
      const totals = (totalRows as any[])[0];
      const urgencyStats = urgencyRows as any[];

      return {
        success: true,
        data: {
          statusStats: stats,
          totalRequests: totals.totalRequests || 0,
          totalEstimatedValue: parseFloat(totals.totalEstimatedValue) || 0,
          averageQuantity: parseFloat(totals.averageQuantity) || 0,
          urgencyStats
        },
        message: 'Transport request statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching transport request stats:', error);
      return {
        success: false,
        message: 'Failed to fetch transport request statistics'
      };
    }
  }

  private calculateEstimatedCost(requestData: any): number {
    let baseRate = 0;

    // Base rate per unit based on quantity unit
    switch (requestData.quantity_unit) {
      case 'liters':
        baseRate = requestData.quantity > 10000 ? 2.5 : 3.0;
        break;
      case 'tons':
        baseRate = requestData.quantity > 20 ? 150 : 180;
        break;
      case 'barrels':
        baseRate = requestData.quantity > 100 ? 25 : 30;
        break;
    }

    // Urgency multiplier
    const urgencyMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.3,
      urgent: 1.8,
    };

    // Type-safe urgency access
    const urgency = requestData.urgency as keyof typeof urgencyMultiplier;
    const urgencyMult = urgencyMultiplier[urgency] || 1.0;

    // Vehicle type multiplier
    const vehicleMultiplier = requestData.vehicle_type === 'Hazardous Material Truck' ? 1.5 :
                             requestData.vehicle_type === 'Refrigerated Truck' ? 1.3 : 1.0;

    // Special requirements multiplier
    const specialMultiplier = (requestData.temperature_control ? 1.2 : 1.0) *
                             (requestData.hazardous_material ? 1.4 : 1.0) *
                             (requestData.insurance_required ? 1.1 : 1.0);

    return Math.round(requestData.quantity * baseRate * urgencyMult * vehicleMultiplier * specialMultiplier);
  }
}
