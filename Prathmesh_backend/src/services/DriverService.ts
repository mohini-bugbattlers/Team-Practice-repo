import db from '../config/mysql';
import bcrypt from 'bcrypt';
import { ServiceResponse, PaginationQuery } from '@/interfaces';

interface DriverData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  total_trips: number;
  completed_trips: number;
  current_trip_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class DriverService {
  async getAllDrivers(query: PaginationQuery = {}): Promise<ServiceResponse<DriverData[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = query;

      const offset = (page - 1) * limit;

      const [rows] = await db.execute(`
        SELECT 
          d.*,
          vo.id as vehicle_owner_id,
          vo.name as vehicle_owner_name,
          vo.email as vehicle_owner_email,
          vo.phone as vehicle_owner_phone
        FROM drivers d
        LEFT JOIN vehicle_owners vo ON d.vehicle_owner_id = vo.id
        ORDER BY d.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM drivers');
      const total = (countRows as any[])[0].total;

      // Format the response to include vehicle_owner as nested object
      const formattedRows = (rows as any[]).map(row => ({
        ...row,
        vehicle_owner: row.vehicle_owner_id ? {
          id: row.vehicle_owner_id,
          name: row.vehicle_owner_name,
          email: row.vehicle_owner_email,
          phone: row.vehicle_owner_phone
        } : null
      }));

      return {
        success: true,
        data: formattedRows as DriverData[],
        message: `Found ${total} drivers`
      };
    } catch (error) {
      console.error('Get drivers error:', error);
      return {
        success: false,
        message: 'Failed to fetch drivers'
      };
    }
  }

  async getDriverById(id: number): Promise<ServiceResponse<DriverData>> {
    try {
      const [rows] = await db.execute(`
        SELECT 
          d.*,
          vo.id as vehicle_owner_id,
          vo.name as vehicle_owner_name,
          vo.email as vehicle_owner_email,
          vo.phone as vehicle_owner_phone
        FROM drivers d
        LEFT JOIN vehicle_owners vo ON d.vehicle_owner_id = vo.id
        WHERE d.id = ?
      `, [id]);

      const drivers = rows as any[];
      if (drivers.length === 0) {
        return {
          success: false,
          message: 'Driver not found'
        };
      }

      // Format the response to include vehicle_owner as nested object
      const driver = drivers[0];
      const formattedDriver = {
        ...driver,
        vehicle_owner: driver.vehicle_owner_id ? {
          id: driver.vehicle_owner_id,
          name: driver.vehicle_owner_name,
          email: driver.vehicle_owner_email,
          phone: driver.vehicle_owner_phone
        } : null
      };

      return {
        success: true,
        data: formattedDriver,
        message: 'Driver found successfully'
      };
    } catch (error) {
      console.error('Get driver by id error:', error);
      return {
        success: false,
        message: 'Failed to fetch driver'
      };
    }
  }

  async createDriver(driverData: {
    name: string;
    email: string;
    phone: string;
    license_number: string;
    experience_years: number;
    status?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<ServiceResponse<DriverData & { user?: any }>> {
    try {
      // Validate required fields
      if (!driverData.name || !driverData.email || !driverData.phone || !driverData.license_number) {
        return {
          success: false,
          message: 'Name, email, phone, and license number are required fields'
        };
      }

      // Validate password if provided
      if (driverData.password) {
        if (driverData.password.length < 6) {
          return {
            success: false,
            message: 'Password must be at least 6 characters long'
          };
        }

        if (driverData.password !== driverData.confirmPassword) {
          return {
            success: false,
            message: 'Passwords do not match'
          };
        }
      }

      // Check if email already exists in drivers table
      const [existingDriver] = await db.execute('SELECT id FROM drivers WHERE email = ?', [driverData.email]);
      if ((existingDriver as any[]).length > 0) {
        return {
          success: false,
          message: 'Driver with this email already exists'
        };
      }

      // Check if email already exists in users table
      const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [driverData.email]);
      if ((existingUser as any[]).length > 0) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Insert driver with proper null handling
      const [result] = await db.execute(
        `INSERT INTO drivers
         (name, email, phone, license_number, experience_years, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          driverData.name || null,
          driverData.email || null,
          driverData.phone || null,
          driverData.license_number || null,
          driverData.experience_years || 0
        ]
      );

      const insertId = (result as any).insertId;

      // Create user account if password is provided
      let userData = null;
      if (driverData.password) {
        const hashedPassword = await bcrypt.hash(driverData.password, 10);

        const [userResult] = await db.execute(
          'INSERT INTO users (email, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
          [driverData.email, hashedPassword, 'driver', driverData.name, driverData.phone, driverData.status || 'active']
        );

        const userId = (userResult as any).insertId;

        // Get user data for response
        const [userRows] = await db.execute('SELECT id, email, role, name, phone, status, created_at FROM users WHERE id = ?', [userId]);
        userData = (userRows as any[])[0];
      }

      // Get created driver with user data
      const driverResult = await this.getDriverById(insertId);

      return {
        success: true,
        data: {
          ...(driverResult.data as DriverData),
          user: userData
        },
        message: 'Driver created successfully' + (driverData.password ? ' with user account' : '')
      };
    } catch (error) {
      console.error('Create driver error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create driver'
      };
    }
  }

  async updateDriver(id: number, driverData: Partial<{
    name: string;
    email: string;
    phone: string;
    license_number: string;
    experience_years: number;
    status: string;
  }>): Promise<ServiceResponse<DriverData>> {
    try {
      // Check if driver exists
      const [existing] = await db.execute('SELECT id FROM drivers WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Driver not found'
        };
      }

      // Check if email already exists (for another driver)
      if (driverData.email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM drivers WHERE email = ? AND id != ?',
          [driverData.email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return {
            success: false,
            message: 'Email already exists for another driver'
          };
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (driverData.name) {
        updateFields.push('name = ?');
        params.push(driverData.name);
      }
      if (driverData.email) {
        updateFields.push('email = ?');
        params.push(driverData.email);
      }
      if (driverData.phone) {
        updateFields.push('phone = ?');
        params.push(driverData.phone);
      }
      if (driverData.license_number) {
        updateFields.push('license_number = ?');
        params.push(driverData.license_number);
      }
      if (driverData.experience_years !== undefined) {
        updateFields.push('experience_years = ?');
        params.push(driverData.experience_years);
      }
      if (driverData.status) {
        updateFields.push('status = ?');
        params.push(driverData.status);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No fields to update'
        };
      }

      updateFields.push('updated_at = NOW()');
      params.push(id);

      await db.execute(
        `UPDATE drivers SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Get updated driver
      return await this.getDriverById(id);
    } catch (error) {
      console.error('Update driver error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update driver'
      };
    }
  }

  async deleteDriver(id: number): Promise<ServiceResponse<null>> {
    try {
      // Check if driver exists
      const [existing] = await db.execute('SELECT id FROM drivers WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Driver not found'
        };
      }

      // Check if there are any related trips
      const [tripCheck] = await db.execute('SELECT COUNT(*) as count FROM trips WHERE driver_id = ?', [id]);
      const tripCount = (tripCheck as any[])[0].count;

      if (tripCount > 0) {
        return {
          success: false,
          message: `Cannot delete driver. Found ${tripCount} related trips. Please delete or reassign these records first.`
        };
      }

      await db.execute('DELETE FROM drivers WHERE id = ?', [id]);

      return {
        success: true,
        data: null,
        message: 'Driver deleted successfully'
      };
    } catch (error) {
      console.error('Delete driver error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete driver'
      };
    }
  }

  async getDriverStats(): Promise<ServiceResponse<any>> {
    try {
      const [statsRows] = await db.execute(`
        SELECT
          status,
          COUNT(*) as count
        FROM drivers
        GROUP BY status
      `);

      const [totalRows] = await db.execute(`
        SELECT
          COUNT(*) as totalDrivers,
          AVG(TIMESTAMPDIFF(YEAR, created_at, NOW())) as avgExperience
        FROM drivers
      `);

      const stats = statsRows as any[];
      const totals = (totalRows as any[])[0];

      return {
        success: true,
        data: {
          stats,
          totalDrivers: totals.totalDrivers || 0,
          avgExperience: Math.round(totals.avgExperience || 0)
        },
        message: 'Driver statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get driver stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch driver statistics'
      };
    }
  }
}
