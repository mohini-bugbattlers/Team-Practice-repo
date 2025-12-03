import db from '../../config/mysql';
import { ServiceResponse } from '@/interfaces';

export class DriverService {
  async getDriverTrips(driverId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as company_name, c.registration_number as company_reg,
               vo.name as vehicle_owner_name, vo.fleet_size
        FROM trips t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN vehicle_owners vo ON t.vehicle_owner_id = vo.id
        WHERE t.driver_id = ?
        ORDER BY t.created_at DESC
      `, [driverId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Driver trips retrieved successfully'
      };
    } catch (error) {
      console.error('Get driver trips error:', error);
      return {
        success: false,
        message: 'Failed to fetch driver trips'
      };
    }
  }

  async getDriverPayments(driverId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, t.trip_number, t.route, c.name as company_name
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.driver_id = ?
        ORDER BY p.created_at DESC
      `, [driverId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Driver payments retrieved successfully'
      };
    } catch (error) {
      console.error('Get driver payments error:', error);
      return {
        success: false,
        message: 'Failed to fetch driver payments'
      };
    }
  }

  async getDriverDashboardStats(driverId: number): Promise<ServiceResponse<any>> {
    try {
      // Get driver trip statistics
      const [tripStats] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as totalRevenue
        FROM trips
        WHERE driver_id = ?
      `, [driverId]);

      const stats = (tripStats as any[])[0];

      return {
        success: true,
        data: {
          totalTrips: stats.totalTrips || 0,
          completedTrips: stats.completedTrips || 0,
          activeTrips: stats.activeTrips || 0,
          totalRevenue: parseFloat(stats.totalRevenue) || 0
        },
        message: 'Driver dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get driver dashboard stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch driver dashboard statistics'
      };
    }
  }
}
