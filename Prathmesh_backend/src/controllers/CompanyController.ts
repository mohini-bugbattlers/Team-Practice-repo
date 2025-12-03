import { Request, Response } from 'express';
import db from '../config/mysql';
import { ApiResponse } from '../interfaces';
import bcrypt from 'bcrypt';
export class CompanyController {
  static async getAllCompanies(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [rows] = await db.execute(`
        SELECT * FROM companies
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [parseInt(limit as string), offset]);

      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM companies');
      const total = (countRows as any[])[0].total;

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        },
        message: `Found ${total} companies`
      } as ApiResponse);
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch companies'
      } as ApiResponse);
    }
  }

  static async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [rows] = await db.execute('SELECT * FROM companies WHERE id = ?', [id]);

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: (rows as any[])[0]
      } as ApiResponse);
    } catch (error) {
      console.error('Get company by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company'
      } as ApiResponse);
    }
  }




  static async createCompany(req: Request, res: Response) {
    try {
      const { name, email, phone, address, registration_number, gst_number, status } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !address || !registration_number) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, address, and registration number are required fields'
        } as ApiResponse);
      }

      // Check if email already exists in companies table
      const [existingCompany] = await db.execute('SELECT id FROM companies WHERE email = ?', [email]);
      if ((existingCompany as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Company with this email already exists'
        } as ApiResponse);
      }

      // Check if email already exists in users table
      const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
      if ((existingUser as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        } as ApiResponse);
      }

      // Create company record
      const [result] = await db.execute(
        'INSERT INTO companies (name, email, phone, address, registration_number, gst_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, registration_number, gst_number || null, status || 'active']
      );

      const insertId = (result as any).insertId;

      res.status(201).json({
        success: true,
        data: {
          id: insertId,
          name,
          email,
          phone,
          address,
          registration_number,
          gst_number,
          status: status || 'active',
          totalTrips: 0,
          activeTrips: 0,
          createdAt: new Date().toISOString()
        },
        message: 'Company created successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Create company error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create company'
      } as ApiResponse);
    }
  }

  static async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, phone, address, registration_number, gst_number, status } = req.body;

      // Check if company exists
      const [existing] = await db.execute('SELECT id FROM companies WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        } as ApiResponse);
      }

      // Check if email already exists (for another company)
      if (email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM companies WHERE email = ? AND id != ?',
          [email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists for another company'
          } as ApiResponse);
        }
      }

      const updateFields: string[] = [];
      const params: any[] = [];

      if (name) {
        updateFields.push('name = ?');
        params.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        params.push(email);
      }
      if (phone) {
        updateFields.push('phone = ?');
        params.push(phone);
      }
      if (address) {
        updateFields.push('address = ?');
        params.push(address);
      }
      if (registration_number) {
        updateFields.push('registration_number = ?');
        params.push(registration_number);
      }
      if (gst_number !== undefined) {
        updateFields.push('gst_number = ?');
        params.push(gst_number);
      }
      if (status) {
        updateFields.push('status = ?');
        params.push(status);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        } as ApiResponse);
      }

      updateFields.push('updated_at = NOW()');
      params.push(id);

      await db.execute(
        `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Get updated company
      const [updated] = await db.execute('SELECT * FROM companies WHERE id = ?', [id]);

      res.json({
        success: true,
        data: (updated as any[])[0],
        message: 'Company updated successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company'
      } as ApiResponse);
    }
  }

  static async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if company exists
      const [existing] = await db.execute('SELECT id FROM companies WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        } as ApiResponse);
      }

      // Check if there are any related trips
      const [tripCheck] = await db.execute('SELECT COUNT(*) as count FROM trips WHERE company_id = ?', [id]);
      const tripCount = (tripCheck as any[])[0].count;

      // Check if there are any related payments
      const [paymentCheck] = await db.execute('SELECT COUNT(*) as count FROM payments WHERE company_id = ?', [id]);
      const paymentCount = (paymentCheck as any[])[0].count;

      if (tripCount > 0 || paymentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete company. Found ${tripCount} related trips and ${paymentCount} related payments. Please delete or reassign these records first.`
        } as ApiResponse);
      }

      await db.execute('DELETE FROM companies WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Company deleted successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Delete company error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete company'
      } as ApiResponse);
    }
  }

  static async getCompanyStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if company exists
      const [existing] = await db.execute('SELECT id FROM companies WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        } as ApiResponse);
      }

      // Get company stats
      const [statsRows] = await db.execute(`
        SELECT
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTrips
        FROM trips
        WHERE company_id = ?
      `, [id]);

      const stats = (statsRows as any[])[0];

      res.json({
        success: true,
        data: {
          totalTrips: stats.totalTrips || 0,
          completedTrips: stats.completedTrips || 0,
          activeTrips: stats.activeTrips || 0,
          pendingTrips: stats.pendingTrips || 0
        },
        message: 'Company stats retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Get company stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company stats'
      } as ApiResponse);
    }
  }
}
