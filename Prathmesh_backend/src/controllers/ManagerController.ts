import { Request, Response } from 'express';
import db from '../config/mysql';
import bcrypt from 'bcrypt';
import { ApiResponse } from '../interfaces';

export class ManagerController {
  static async getAllManagers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [rows] = await db.execute(`
        SELECT * FROM managers
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [parseInt(limit as string), offset]);

      const [countRows] = await db.execute('SELECT COUNT(*) as total FROM managers');
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
        message: `Found ${total} managers`
      } as ApiResponse);
    } catch (error) {
      console.error('Get managers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch managers'
      } as ApiResponse);
    }
  }

  static async getManagerById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [rows] = await db.execute('SELECT * FROM managers WHERE id = ?', [id]);

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: (rows as any[])[0]
      } as ApiResponse);
    } catch (error) {
      console.error('Get manager by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch manager'
      } as ApiResponse);
    }
  }

  static async createManager(req: Request, res: Response) {
    try {
      const { name, email, phone, department, status } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !department) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, and department are required fields'
        } as ApiResponse);
      }

      // Check if email already exists in managers table
      const [existingManager] = await db.execute('SELECT id FROM managers WHERE email = ?', [email]);
      if ((existingManager as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Manager with this email already exists'
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

      // Create manager record
      const [result] = await db.execute(
        'INSERT INTO managers (name, email, phone, department, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, department, status || 'active']
      );

      const insertId = (result as any).insertId;

      res.status(201).json({
        success: true,
        data: {
          id: insertId,
          name,
          email,
          phone,
          department,
          status: status || 'active',
          totalManagedTrips: 0,
          createdAt: new Date().toISOString()
        },
        message: 'Manager created successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Create manager error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create manager'
      } as ApiResponse);
    }
  }

  static async updateManager(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, phone, department, status } = req.body;

      // Check if manager exists
      const [existing] = await db.execute('SELECT id FROM managers WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found'
        } as ApiResponse);
      }

      // Check if email already exists (for another manager)
      if (email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM managers WHERE email = ? AND id != ?',
          [email, id]
        );
        if ((emailCheck as any[]).length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists for another manager'
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
      if (department) {
        updateFields.push('department = ?');
        params.push(department);
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
        `UPDATE managers SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Get updated manager
      const [updated] = await db.execute('SELECT * FROM managers WHERE id = ?', [id]);

      res.json({
        success: true,
        data: (updated as any[])[0],
        message: 'Manager updated successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Update manager error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update manager'
      } as ApiResponse);
    }
  }

  static async deleteManager(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if manager exists
      const [existing] = await db.execute('SELECT id FROM managers WHERE id = ?', [id]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found'
        } as ApiResponse);
      }

      await db.execute('DELETE FROM managers WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Manager deleted successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Delete manager error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete manager'
      } as ApiResponse);
    }
  }
}
