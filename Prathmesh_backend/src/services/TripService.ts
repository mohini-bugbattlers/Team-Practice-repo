import db from '../config/mysql';
import { ServiceResponse, PaginationQuery, TripQuery } from '@/interfaces';

interface TripData {
  id?: number;
  trip_number: string;
  company_id: number;
  companyName?: string;
  vehicle_owner_id: number;
  vehicleOwnerName?: string;
  driver_id: number;
  driverName?: string;
  route: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  start_date: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  base_amount: number;
  service_charge: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

export class TripService {
  async getAllTrips(query: TripQuery = {}): Promise<ServiceResponse<TripData[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        status,
        company_id,
        vehicle_owner_id,
        startDate,
        endDate
      } = query;

      let sql = `
        SELECT t.*, c.name as companyName, vo.name as vehicleOwnerName,
               d.name as driverName
        FROM trips t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN vehicle_owners vo ON t.vehicle_owner_id = vo.id
        LEFT JOIN drivers d ON t.driver_id = d.id
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (status) {
        conditions.push('t.status = ?');
        params.push(status);
      }

      if (company_id) {
        conditions.push('t.company_id = ?');
        params.push(company_id);
      }

      if (vehicle_owner_id) {
        conditions.push('t.vehicle_owner_id = ?');
        params.push(vehicle_owner_id);
      }

      if (startDate && endDate) {
        conditions.push('t.created_at BETWEEN ? AND ?');
        params.push(startDate, endDate);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Apply sorting
      sql += ` ORDER BY t.created_at ${sortOrder}`;

      // Apply pagination
      const offset = (page - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(sql, params);
      const trips = rows as TripData[];

      // Get total count for pagination info
      let countSql = 'SELECT COUNT(*) as total FROM trips t';
      if (conditions.length > 0) {
        countSql += ' WHERE ' + conditions.join(' AND ');
      }

      const [countRows] = await db.execute(countSql, params.slice(0, -2)); // Remove limit and offset params
      const total = (countRows as any[])[0].total;

      return {
        success: true,
        data: trips,
        message: `Found ${total} trips`
      };
    } catch (error) {
      console.error('Get trips error:', error);
      return {
        success: false,
        message: 'Failed to fetch trips'
      };
    }
  }

  async getTripById(id: number): Promise<ServiceResponse<TripData>> {
    try {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as companyName, vo.name as vehicleOwnerName,
               d.name as driverName
        FROM trips t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN vehicle_owners vo ON t.vehicle_owner_id = vo.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = ?
      `, [id]);

      const trips = rows as TripData[];
      if (trips.length === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      return {
        success: true,
        data: trips[0],
        message: 'Trip found successfully'
      };
    } catch (error) {
      console.error('Get trip by id error:', error);
      return {
        success: false,
        message: 'Failed to fetch trip'
      };
    }
  }

  async createTrip(tripData: {
    trip_number: string;
    company_id: number;
    vehicle_owner_id: number;
    driver_id: number;
    route: string;
    start_date: string;
    estimated_delivery_date: string;
    base_amount: number;
    service_charge: number;
    status?: string;
  }): Promise<ServiceResponse<TripData>> {
    try {
      // Validate required fields
      if (!tripData.trip_number || !tripData.company_id || !tripData.vehicle_owner_id || !tripData.driver_id || !tripData.route) {
        return {
          success: false,
          message: 'Trip number, company, vehicle owner, driver, and route are required fields'
        };
      }

      // Check if trip number already exists
      const [existingTrips] = await db.execute(
        'SELECT id FROM trips WHERE trip_number = ?',
        [tripData.trip_number]
      );

      if ((existingTrips as any[]).length > 0) {
        return {
          success: false,
          message: 'Trip number already exists'
        };
      }

      // Insert trip with correct column names
      const [result] = await db.execute(
        `INSERT INTO trips
         (trip_number, company_id, vehicle_owner_id, driver_id, route, status, start_date, estimated_delivery_date, base_amount, service_charge, total_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tripData.trip_number,
          tripData.company_id,
          tripData.vehicle_owner_id,
          tripData.driver_id,
          tripData.route,
          tripData.start_date,
          tripData.estimated_delivery_date,
          tripData.base_amount || 0,
          tripData.service_charge || 0,
          (tripData.base_amount || 0) + (tripData.service_charge || 0)
        ]
      );

      const insertId = (result as any).insertId;

      // Get created trip
      return await this.getTripById(insertId);
    } catch (error) {
      console.error('Create trip error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create trip'
      };
    }
  }

  async updateTrip(id: number, tripData: Partial<{
    company_id: number;
    vehicle_owner_id: number;
    driver_id: number;
    route: string;
    status: string;
    start_date: string;
    estimated_delivery_date: string;
    actual_delivery_date: string;
    base_amount: number;
    service_charge: number;
    total_amount: number;
  }>): Promise<ServiceResponse<TripData>> {
    try {
      // Check if trip exists
      const [existing] = await db.execute('SELECT id FROM trips WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (tripData.company_id) {
        updateFields.push('company_id = ?');
        params.push(tripData.company_id);
      }
      if (tripData.vehicle_owner_id) {
        updateFields.push('vehicle_owner_id = ?');
        params.push(tripData.vehicle_owner_id);
      }
      if (tripData.driver_id) {
        updateFields.push('driver_id = ?');
        params.push(tripData.driver_id);
      }
      if (tripData.route) {
        updateFields.push('route = ?');
        params.push(tripData.route);
      }
      if (tripData.status) {
        updateFields.push('status = ?');
        params.push(tripData.status);
      }
      if (tripData.start_date) {
        updateFields.push('start_date = ?');
        params.push(tripData.start_date);
      }
      if (tripData.estimated_delivery_date) {
        updateFields.push('estimated_delivery_date = ?');
        params.push(tripData.estimated_delivery_date);
      }
      if (tripData.actual_delivery_date) {
        updateFields.push('actual_delivery_date = ?');
        params.push(tripData.actual_delivery_date);
      }
      if (tripData.base_amount !== undefined) {
        updateFields.push('base_amount = ?');
        params.push(tripData.base_amount);
      }
      if (tripData.service_charge !== undefined) {
        updateFields.push('service_charge = ?');
        params.push(tripData.service_charge);
      }
      if (tripData.total_amount !== undefined) {
        updateFields.push('total_amount = ?');
        params.push(tripData.total_amount);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No fields to update'
        };
      }

      updateFields.push('updated_at = NOW()');
      params.push(id);

      const [result] = await db.execute(
        `UPDATE trips SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      // Get updated trip
      return await this.getTripById(id);
    } catch (error) {
      console.error('Update trip error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update trip'
      };
    }
  }

  async updateTripStatus(id: number, status: string): Promise<ServiceResponse<TripData>> {
    try {
      let updateSql = 'UPDATE trips SET status = ?, updated_at = NOW()';

      if (status === 'in_transit') {
        updateSql += ', start_date = NOW()';
      } else if (status === 'completed') {
        updateSql += ', actual_delivery_date = NOW()';
      }

      updateSql += ' WHERE id = ?';

      const [result] = await db.execute(updateSql, [status, id]);

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      // Get updated trip
      return await this.getTripById(id);
    } catch (error) {
      console.error('Update trip status error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update trip status'
      };
    }
  }

  async deleteTrip(id: number): Promise<ServiceResponse<null>> {
    try {
      const [result] = await db.execute(
        'DELETE FROM trips WHERE id = ?',
        [id]
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'Trip deleted successfully'
      };
    } catch (error) {
      console.error('Delete trip error:', error);
      return {
        success: false,
        message: 'Failed to delete trip'
      };
    }
  }

  async getTripStats(): Promise<ServiceResponse<any>> {
    try {
      const [statsRows] = await db.execute(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(total_amount) as totalRevenue,
          SUM(base_amount) as totalEstimated
        FROM trips
        GROUP BY status
      `);

      const [totalRows] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(total_amount) as totalRevenue,
          AVG(total_amount) as averageCost
        FROM trips
        WHERE status = 'completed'
      `);

      const stats = statsRows as any[];
      const totals = (totalRows as any[])[0];

      return {
        success: true,
        data: {
          stats,
          totalTrips: totals.totalTrips || 0,
          totalRevenue: parseFloat(totals.totalRevenue) || 0,
          averageCost: parseFloat(totals.averageCost) || 0
        },
        message: 'Trip statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get trip stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch trip statistics'
      };
    }
  }
}
