import db from '../config/mysql';
import { ServiceResponse, PaginationQuery } from '@/interfaces';

interface CompanyData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export class CompanyService {
  async getAllCompanies(query: PaginationQuery = {}): Promise<ServiceResponse<CompanyData[]>> {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = query;

      let sql = 'SELECT * FROM companies';
      const params: any[] = [];

      // Apply sorting
      sql += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Apply pagination
      const offset = (page - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(sql, params);
      const companies = rows as CompanyData[];

      // Get total count for pagination info
      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM companies');
      const total = (countRows as any[])[0].total;

      return {
        success: true,
        data: companies,
        message: `Found ${total} companies`
      };
    } catch (error) {
      console.error('Get companies error:', error);
      return {
        success: false,
        message: 'Failed to fetch companies'
      };
    }
  }

  async getCompanyById(id: number): Promise<ServiceResponse<CompanyData>> {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM companies WHERE id = ?',
        [id]
      );

      const companies = rows as CompanyData[];
      if (companies.length === 0) {
        return {
          success: false,
          message: 'Company not found'
        };
      }

      return {
        success: true,
        data: companies[0],
        message: 'Company found successfully'
      };
    } catch (error) {
      console.error('Get company by id error:', error);
      return {
        success: false,
        message: 'Failed to fetch company'
      };
    }
  }

  async createCompany(companyData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    registration_number: string;
    gst_number?: string;
    status?: 'active' | 'inactive';
  }): Promise<ServiceResponse<CompanyData>> {
    try {
      // Check if company already exists
      const [existingCompanies] = await db.execute(
        'SELECT id FROM companies WHERE email = ?',
        [companyData.email]
      );

      if ((existingCompanies as any[]).length > 0) {
        return {
          success: false,
          message: 'Company already exists with this email'
        };
      }

      // Insert company with correct database column names
      const [result] = await db.execute(
        `INSERT INTO companies
         (name, email, phone, address, registration_number, gst_number, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          companyData.name,
          companyData.email,
          companyData.phone,
          companyData.address,
          companyData.registration_number,
          companyData.gst_number || null,
          companyData.status || 'active'
        ]
      );

      const insertId = (result as any).insertId;

      // Get created company
      return await this.getCompanyById(insertId);
    } catch (error) {
      console.error('Create company error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create company'
      };
    }
  }

  async updateCompany(id: number, companyData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    registration_number: string;
    gst_number: string;
    status: 'active' | 'inactive';
  }>): Promise<ServiceResponse<CompanyData>> {
    try {
      // Check if company exists
      const [existing] = await db.execute('SELECT id FROM companies WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return {
          success: false,
          message: 'Company not found'
        };
      }

      // Check if email already exists (for another company)
      if (companyData.email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM companies WHERE email = ? AND id != ?',
          [companyData.email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return {
            success: false,
            message: 'Email already exists for another company'
          };
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (companyData.name) {
        updateFields.push('name = ?');
        params.push(companyData.name);
      }
      if (companyData.email) {
        updateFields.push('email = ?');
        params.push(companyData.email);
      }
      if (companyData.phone) {
        updateFields.push('phone = ?');
        params.push(companyData.phone);
      }
      if (companyData.address) {
        updateFields.push('address = ?');
        params.push(companyData.address);
      }
      if (companyData.registration_number) {
        updateFields.push('registration_number = ?');
        params.push(companyData.registration_number);
      }
      if (companyData.gst_number !== undefined) {
        updateFields.push('gst_number = ?');
        params.push(companyData.gst_number || null);
      }
      if (companyData.status) {
        updateFields.push('status = ?');
        params.push(companyData.status);
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
        `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Company not found'
        };
      }

      // Get updated company
      return await this.getCompanyById(id);
    } catch (error) {
      console.error('Update company error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update company'
      };
    }
  }

  async deleteCompany(id: number): Promise<ServiceResponse<null>> {
    try {
      const [result] = await db.execute(
        'DELETE FROM companies WHERE id = ?',
        [id]
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Company not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'Company deleted successfully'
      };
    } catch (error) {
      console.error('Delete company error:', error);
      return {
        success: false,
        message: 'Failed to delete company'
      };
    }
  }

  async getCompanyStats(id: number): Promise<ServiceResponse<any>> {
    try {
      // Get company trip statistics
      const [tripStats] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as totalRevenue
        FROM trips
        WHERE company_id = ?
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
        message: 'Company statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Get company stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch company statistics'
      };
    }
  }
}
