import { Request, Response } from 'express';
import db from '../config/mysql';
import { ApiResponse } from '../interfaces';
import bcrypt from 'bcrypt';

export class ProfileController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const [rows] = await db.execute(`
        SELECT id, email, name, phone, role, status, created_at as createdAt
        FROM users
        WHERE id = ?
      `, [userId]);

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
      }

      const user = (rows as any[])[0];

      res.json({
        success: true,
        data: user
      } as ApiResponse);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      } as ApiResponse);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, phone, email } = req.body;

      // Check if user exists
      const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
      }

      // Check if email already exists (for another user)
      if (email) {
        const [emailCheck] = await db.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );
        if ((emailCheck as any[]).length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists for another user'
          } as ApiResponse);
        }
      }

      const updateFields: string[] = [];
      const params: any[] = [];

      if (name) {
        updateFields.push('name = ?');
        params.push(name);
      }
      if (phone) {
        updateFields.push('phone = ?');
        params.push(phone);
      }
      if (email) {
        updateFields.push('email = ?');
        params.push(email);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        } as ApiResponse);
      }

      updateFields.push('updated_at = NOW()');
      params.push(userId);

      await db.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Get updated user
      const [updated] = await db.execute(`
        SELECT id, email, name, phone, role, status, created_at as createdAt
        FROM users
        WHERE id = ?
      `, [userId]);

      res.json({
        success: true,
        data: (updated as any[])[0],
        message: 'Profile updated successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      } as ApiResponse);
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        } as ApiResponse);
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        } as ApiResponse);
      }

      // Get current user with password
      const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
      }

      const user = (rows as any[])[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        } as ApiResponse);
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      } as ApiResponse);
    }
  }

  static async deleteProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Check if user exists
      const [existing] = await db.execute('SELECT id, role FROM users WHERE id = ?', [userId]);
      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
      }

      const user = (existing as any[])[0];

      // Prevent admin from deleting themselves
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin users cannot delete their own profile'
        } as ApiResponse);
      }

      await db.execute('DELETE FROM users WHERE id = ?', [userId]);

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Delete profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile'
      } as ApiResponse);
    }
  }
}
