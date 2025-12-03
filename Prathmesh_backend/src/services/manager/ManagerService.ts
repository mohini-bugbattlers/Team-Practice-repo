import db from '../../config/mysql';
import { ServiceResponse, PaginationQuery } from '../../interfaces';

interface ManagerData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export class ManagerService {
  async getAllManagers(query: PaginationQuery = {}): Promise<ServiceResponse<ManagerData[]>> {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = query;

      let sql = 'SELECT * FROM managers';
      const params: any[] = [];

      // Apply sorting
      sql += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Apply pagination
      const offset = (page - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(sql, params);
      const managers = rows as ManagerData[];

      // Get total count for pagination info
      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM managers');
      const total = (countRows as any[])[0].total;

      return {
        success: true,
        data: managers,
        message: `Found ${total} managers`
      };
    } catch (error) {
      console.error('Get managers error:', error);
      return {
        success: false,
        message: 'Failed to fetch managers'
      };
    }
  }

  async getManagerById(id: number): Promise<ServiceResponse<ManagerData>> {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM managers WHERE id = ?',
        [id]
      );

      const managers = rows as ManagerData[];
      if (managers.length === 0) {
        return {
          success: false,
          message: 'Manager not found'
        };
      }

      return {
        success: true,
        data: managers[0],
        message: 'Manager found successfully'
      };
    } catch (error) {
      console.error('Get manager by id error:', error);
      return {
        success: false,
        message: 'Failed to fetch manager'
      };
    }
  }

  async createManager(managerData: {
    name: string;
    email: string;
    phone: string;
    region: string;
    status?: 'active' | 'inactive';
  }): Promise<ServiceResponse<ManagerData>> {
    try {
      // Check if manager already exists
      const [existingManagers] = await db.execute(
        'SELECT id FROM managers WHERE email = ?',
        [managerData.email]
      );

      if ((existingManagers as any[]).length > 0) {
        return {
          success: false,
          message: 'Manager already exists with this email'
        };
      }

      // Insert manager
      const [result] = await db.execute(
        `INSERT INTO managers
         (name, email, phone, region, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          managerData.name,
          managerData.email,
          managerData.phone,
          managerData.region,
          managerData.status || 'active'
        ]
      );

      const insertId = (result as any).insertId;

      // Get created manager
      return await this.getManagerById(insertId);
    } catch (error) {
      console.error('Create manager error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create manager'
      };
    }
  }

  async updateManager(id: number, managerData: Partial<{
    name: string;
    email: string;
    phone: string;
    region: string;
    status: 'active' | 'inactive';
  }>): Promise<ServiceResponse<ManagerData>> {
    try {
      // Check if manager exists
      const [existing] = await db.execute('SELECT id FROM managers WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Manager not found'
        };
      }

      // Check if email already exists (for another manager)
      if (managerData.email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM managers WHERE email = ? AND id != ?',
          [managerData.email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return {
            success: false,
            message: 'Email already exists for another manager'
          };
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (managerData.name) {
        updateFields.push('name = ?');
        params.push(managerData.name);
      }
      if (managerData.email) {
        updateFields.push('email = ?');
        params.push(managerData.email);
      }
      if (managerData.phone) {
        updateFields.push('phone = ?');
        params.push(managerData.phone);
      }
      if (managerData.region) {
        updateFields.push('region = ?');
        params.push(managerData.region);
      }
      if (managerData.status) {
        updateFields.push('status = ?');
        params.push(managerData.status);
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
        `UPDATE managers SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Manager not found'
        };
      }

      // Get updated manager
      return await this.getManagerById(id);
    } catch (error) {
      console.error('Update manager error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update manager'
      };
    }
  }

  async deleteManager(id: number): Promise<ServiceResponse<null>> {
    try {
      const [result] = await db.execute(
        'DELETE FROM managers WHERE id = ?',
        [id]
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Manager not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'Manager deleted successfully'
      };
    } catch (error) {
      console.error('Delete manager error:', error);
      return {
        success: false,
        message: 'Failed to delete manager'
      };
    }
  }

  async getManagerStats(id: number): Promise<ServiceResponse<any>> {
    try {
      // Get manager trip statistics
      const [tripStats] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as totalRevenue
        FROM trips
        WHERE manager_id = ?
      `, [id]);

      const stats = (tripStats as any[])[0];

      return {
        success: true,
        data: {
          totalTrips: stats.totalTrips || 0,
          completedTrips: stats.completedTrips || 0,
          activeTrips: stats.activeTrips || 0,
          totalRevenue: parseFloat(stats.totalRevenue) || 0
        },
        message: 'Manager statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get manager stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch manager statistics'
      };
    }
  }

  async getManagerTrips(managerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as company_name, c.registration_number as company_reg,
               vo.name as vehicle_owner_name, vo.fleet_size,
               d.name as driver_name, d.license_number, d.experience_years
        FROM trips t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN vehicle_owners vo ON t.vehicle_owner_id = vo.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        WHERE t.manager_id = ?
        ORDER BY t.created_at DESC
      `, [managerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Manager trips retrieved successfully'
      };
    } catch (error) {
      console.error('Get manager trips error:', error);
      return {
        success: false,
        message: 'Failed to fetch manager trips'
      };
    }
  }

  async getManagerPayments(managerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, t.trip_number, t.route, c.name as company_name, vo.name as vehicle_owner_name
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN vehicle_owners vo ON p.vehicle_owner_id = vo.id
        WHERE p.manager_id = ?
        ORDER BY p.created_at DESC
      `, [managerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Manager payments retrieved successfully'
      };
    } catch (error) {
      console.error('Get manager payments error:', error);
      return {
        success: false,
        message: 'Failed to fetch manager payments'
      };
    }
  }

  async getManagerInvoices(managerId: number): Promise<ServiceResponse<any[]>> {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, t.trip_number, t.route, c.name as company_name, vo.name as vehicle_owner_name
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN vehicle_owners vo ON p.vehicle_owner_id = vo.id
        WHERE p.manager_id = ?
        ORDER BY p.created_at DESC
      `, [managerId]);

      return {
        success: true,
        data: rows as any[],
        message: 'Manager invoices retrieved successfully'
      };
    } catch (error) {
      console.error('Get manager invoices error:', error);
      return {
        success: false,
        message: 'Failed to fetch manager invoices'
      };
    }
  }

  async getManagerDashboardStats(managerId: number): Promise<ServiceResponse<any>> {
    try {
      // Get manager trip statistics
      const [tripStats] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as totalRevenue
        FROM trips
        WHERE manager_id = ?
      `, [managerId]);

      const stats = (tripStats as any[])[0];

      return {
        success: true,
        data: {
          totalTrips: stats.totalTrips || 0,
          completedTrips: stats.completedTrips || 0,
          activeTrips: stats.activeTrips || 0,
          totalRevenue: parseFloat(stats.totalRevenue) || 0
        },
        message: 'Manager dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get manager dashboard stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch manager dashboard statistics'
      };
    }
  }
}
