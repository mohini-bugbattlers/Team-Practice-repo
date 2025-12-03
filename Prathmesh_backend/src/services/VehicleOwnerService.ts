import db from '../config/mysql';
import bcrypt from 'bcrypt';
import { ServiceResponse, PaginationQuery } from '@/interfaces';

interface VehicleOwnerData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  fleetSize: number;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
  driver_count?: number;
  drivers?: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    license_number: string;
    experience_years: number;
    status: string;
  }>;
}

export class VehicleOwnerService {
  async getAllVehicleOwners(query: PaginationQuery = {}): Promise<ServiceResponse<VehicleOwnerData[]>> {
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
          vo.*,
          COUNT(d.id) as driver_count,
          GROUP_CONCAT(
            CONCAT(
              d.id, ':', d.name, ':', d.email, ':', d.phone, ':', 
              d.license_number, ':', d.experience_years, ':', d.status
            ) SEPARATOR '|'
          ) as drivers_info
        FROM vehicle_owners vo
        LEFT JOIN drivers d ON vo.id = d.vehicle_owner_id
        GROUP BY vo.id
        ORDER BY vo.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM vehicle_owners');
      const total = (countRows as any[])[0].total;

      // Format the response to include drivers as nested array
      const formattedRows = (rows as any[]).map(row => {
        const drivers = [];
        if (row.drivers_info) {
          const driverStrings = row.drivers_info.split('|');
          for (const driverString of driverStrings) {
            const [id, name, email, phone, license_number, experience_years, status] = driverString.split(':');
            if (id) {
              drivers.push({
                id: parseInt(id),
                name,
                email,
                phone,
                license_number,
                experience_years: parseInt(experience_years),
                status
              });
            }
          }
        }

        return {
          ...row,
          driver_count: row.driver_count || 0,
          drivers: drivers
        };
      });

      return {
        success: true,
        data: formattedRows as VehicleOwnerData[],
        message: `Found ${total} vehicle owners`
      };
    } catch (error) {
      console.error('Get vehicle owners error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owners'
      };
    }
  }

  async getVehicleOwnerById(id: number): Promise<ServiceResponse<VehicleOwnerData>> {
    try {
      const [rows] = await db.execute(`
        SELECT 
          vo.*,
          COUNT(d.id) as driver_count,
          GROUP_CONCAT(
            CONCAT(
              d.id, ':', d.name, ':', d.email, ':', d.phone, ':', 
              d.license_number, ':', d.experience_years, ':', d.status
            ) SEPARATOR '|'
          ) as drivers_info
        FROM vehicle_owners vo
        LEFT JOIN drivers d ON vo.id = d.vehicle_owner_id
        WHERE vo.id = ?
        GROUP BY vo.id
      `, [id]);

      const owners = rows as any[];
      if (owners.length === 0) {
        return {
          success: false,
          message: 'Vehicle owner not found'
        };
      }

      // Format the response to include drivers as nested array
      const owner = owners[0];
      const drivers = [];
      if (owner.drivers_info) {
        const driverStrings = owner.drivers_info.split('|');
        for (const driverString of driverStrings) {
          const [id, name, email, phone, license_number, experience_years, status] = driverString.split(':');
          if (id) {
            drivers.push({
              id: parseInt(id),
              name,
              email,
              phone,
              license_number,
              experience_years: parseInt(experience_years),
              status
            });
          }
        }
      }

      const formattedOwner = {
        ...owner,
        driver_count: owner.driver_count || 0,
        drivers: drivers
      };

      return {
        success: true,
        data: formattedOwner,
        message: 'Vehicle owner found successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner by id error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owner'
      };
    }
  }

  async createVehicleOwner(ownerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    fleetSize: number;
    status?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<ServiceResponse<VehicleOwnerData & { user?: any }>> {
    try {
      // Validate required fields
      if (!ownerData.name || !ownerData.email || !ownerData.phone || !ownerData.address) {
        return {
          success: false,
          message: 'Name, email, phone, and address are required fields'
        };
      }

      // Validate password if provided
      if (ownerData.password) {
        if (ownerData.password.length < 6) {
          return {
            success: false,
            message: 'Password must be at least 6 characters long'
          };
        }

        if (ownerData.password !== ownerData.confirmPassword) {
          return {
            success: false,
            message: 'Passwords do not match'
          };
        }
      }

      // Check if email already exists in vehicle_owners table
      const [existingOwner] = await db.execute('SELECT id FROM vehicle_owners WHERE email = ?', [ownerData.email]);
      if ((existingOwner as any[]).length > 0) {
        return {
          success: false,
          message: 'Vehicle owner with this email already exists'
        };
      }

      // Check if email already exists in users table
      const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [ownerData.email]);
      if ((existingUser as any[]).length > 0) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Insert vehicle owner with proper null handling
      const [result] = await db.execute(
        `INSERT INTO vehicle_owners
         (name, email, phone, address, gst_number, fleet_size, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          ownerData.name || null,
          ownerData.email || null,
          ownerData.phone || null,
          ownerData.address || null,
          ownerData.gstNumber || null,
          ownerData.fleetSize || 0
        ]
      );

      const insertId = (result as any).insertId;

      // Create user account if password is provided
      let userData = null;
      if (ownerData.password) {
        const hashedPassword = await bcrypt.hash(ownerData.password, 10);

        const [userResult] = await db.execute(
          'INSERT INTO users (email, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
          [ownerData.email, hashedPassword, 'vehicle_owner', ownerData.name, ownerData.phone, ownerData.status || 'active']
        );

        const userId = (userResult as any).insertId;

        // Get user data for response
        const [userRows] = await db.execute('SELECT id, email, role, name, phone, status, created_at FROM users WHERE id = ?', [userId]);
        userData = (userRows as any[])[0];
      }

      // Get created vehicle owner with user data
      const ownerResult = await this.getVehicleOwnerById(insertId);

      return {
        success: true,
        data: {
          ...(ownerResult.data as VehicleOwnerData),
          user: userData
        },
        message: 'Vehicle owner created successfully' + (ownerData.password ? ' with user account' : '')
      };
    } catch (error) {
      console.error('Create vehicle owner error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create vehicle owner'
      };
    }
  }

  async updateVehicleOwner(id: number, ownerData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    fleetSize: number;
    status: string;
  }>): Promise<ServiceResponse<VehicleOwnerData>> {
    try {
      // Check if vehicle owner exists
      const [existing] = await db.execute('SELECT id FROM vehicle_owners WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Vehicle owner not found'
        };
      }

      // Check if email already exists (for another owner)
      if (ownerData.email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM vehicle_owners WHERE email = ? AND id != ?',
          [ownerData.email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return {
            success: false,
            message: 'Email already exists for another vehicle owner'
          };
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (ownerData.name) {
        updateFields.push('name = ?');
        params.push(ownerData.name);
      }
      if (ownerData.email) {
        updateFields.push('email = ?');
        params.push(ownerData.email);
      }
      if (ownerData.phone) {
        updateFields.push('phone = ?');
        params.push(ownerData.phone);
      }
      if (ownerData.address) {
        updateFields.push('address = ?');
        params.push(ownerData.address);
      }
      if (ownerData.gstNumber) {
        updateFields.push('gst_number = ?');
        params.push(ownerData.gstNumber);
      }
      if (ownerData.fleetSize !== undefined) {
        updateFields.push('fleet_size = ?');
        params.push(ownerData.fleetSize);
      }
      if (ownerData.status) {
        updateFields.push('status = ?');
        params.push(ownerData.status);
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
        `UPDATE vehicle_owners SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Get updated vehicle owner
      return await this.getVehicleOwnerById(id);
    } catch (error) {
      console.error('Update vehicle owner error:', error);
      return {
        success: false,
        message: 'Failed to update vehicle owner'
      };
    }
  }

  async deleteVehicleOwner(id: number): Promise<ServiceResponse<null>> {
    try {
      // Check if vehicle owner exists
      const [existing] = await db.execute('SELECT id FROM vehicle_owners WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Vehicle owner not found'
        };
      }

      // Check if there are any related trips
      const [tripCheck] = await db.execute('SELECT COUNT(*) as count FROM trips WHERE vehicle_owner_id = ?', [id]);
      const tripCount = (tripCheck as any[])[0].count;

      // Check if there are any related payments
      const [paymentCheck] = await db.execute('SELECT COUNT(*) as count FROM payments WHERE vehicle_owner_id = ?', [id]);
      const paymentCount = (paymentCheck as any[])[0].count;

      if (tripCount > 0 || paymentCount > 0) {
        return {
          success: false,
          message: `Cannot delete vehicle owner. Found ${tripCount} related trips and ${paymentCount} related payments. Please delete or reassign these records first.`
        };
      }

      await db.execute('DELETE FROM vehicle_owners WHERE id = ?', [id]);

      return {
        success: true,
        data: null,
        message: 'Vehicle owner deleted successfully'
      };
    } catch (error) {
      console.error('Delete vehicle owner error:', error);
      return {
        success: false,
        message: 'Failed to delete vehicle owner'
      };
    }
  }

  async getVehicleOwnerStats(): Promise<ServiceResponse<any>> {
    try {
      const [statsRows] = await db.execute(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(fleet_size) as totalFleet
        FROM vehicle_owners
        GROUP BY status
      `);

      const [totalRows] = await db.execute(`
        SELECT
          COUNT(*) as totalOwners,
          SUM(fleet_size) as totalFleet,
          AVG(fleet_size) as avgFleetSize
        FROM vehicle_owners
      `);

      const stats = statsRows as any[];
      const totals = (totalRows as any[])[0];

      return {
        success: true,
        data: {
          stats,
          totalOwners: totals.totalOwners || 0,
          totalFleet: totals.totalFleet || 0,
          avgFleetSize: Math.round(totals.avgFleetSize || 0)
        },
        message: 'Vehicle owner statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get vehicle owner stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch vehicle owner statistics'
      };
    }
  }
}
