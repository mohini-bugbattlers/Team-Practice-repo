import db from '../../config/mysql';
import { ServiceResponse } from '@/interfaces';

export class VehicleOwnerService {
  async getVehicleOwnerTrips(vehicleOwnerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as company_name, c.registration_number as company_reg,
               d.name as driver_name, d.license_number, d.experience_years
        FROM trips t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        WHERE t.vehicle_owner_id = ?
        ORDER BY t.created_at DESC
      `, [vehicleOwnerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Vehicle owner trips retrieved successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner trips error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owner trips'
      };
    }
  }

  async getVehicleOwnerPayments(vehicleOwnerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, t.trip_number, t.route, c.name as company_name
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.vehicle_owner_id = ?
        ORDER BY p.created_at DESC
      `, [vehicleOwnerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Vehicle owner payments retrieved successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner payments error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owner payments'
      };
    }
  }

  async getVehicleOwnerInvoices(vehicleOwnerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, t.trip_number, t.route, c.name as company_name
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.vehicle_owner_id = ?
        ORDER BY p.created_at DESC
      `, [vehicleOwnerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Vehicle owner invoices retrieved successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner invoices error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owner invoices'
      };
    }
  }

  async getVehicleOwnerDashboardStats(vehicleOwnerId: number): Promise<ServiceResponse<any>> {
    try {
      // Get vehicle owner trip statistics
      const [tripStats] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as totalRevenue
        FROM trips
        WHERE vehicle_owner_id = ?
      `, [vehicleOwnerId]);

      const stats = (tripStats as any[])[0];

      return {
        success: true,
        data: {
          totalTrips: stats.totalTrips || 0,
          completedTrips: stats.completedTrips || 0,
          activeTrips: stats.activeTrips || 0,
          totalRevenue: parseFloat(stats.totalRevenue) || 0
        },
        message: 'Vehicle owner dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner dashboard stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch vehicle owner dashboard statistics'
      };
    }
  }
}
