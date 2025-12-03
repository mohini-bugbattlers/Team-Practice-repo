import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/mysql';
import { LoginRequest, LoginResponse, ServiceResponse } from '../interfaces';

interface UserData {
  id?: number;
  email: string;
  password: string;
  role: 'admin' | 'company' | 'manager' | 'vehicle_owner' | 'driver';
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthService {
  async login(loginData: LoginRequest): Promise<ServiceResponse<LoginResponse>> {
    try {
      const { email, password } = loginData;

      // Find user by email using direct SQL
      const [userRows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const users = userRows as UserData[];
      if (users.length === 0) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'Account is inactive'
        };
      }

      // For company users, get company ID
      let companyId = null;
      if (user.role === 'company') {
        const [companyRows] = await db.execute(
          'SELECT id FROM companies WHERE email = ?',
          [email]
        );
        const companies = companyRows as any[];
        if (companies.length > 0) {
          companyId = companies[0].id;
        }
      }

      // Generate JWT token based on role
      const secret = user.role === 'company'
        ? process.env.JWT_COMPANY_SECRET || process.env.JWT_SECRET || 'default-secret'
        : process.env.JWT_SECRET || 'default-secret';

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: companyId, // Include company ID for company users
        },
        secret,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id!,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            status: user.status,
            companyId: companyId, // Include company ID in response
          }
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async getUserByEmail(email: string): Promise<ServiceResponse<UserData>> {
    try {
      const [userRows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const users = userRows as UserData[];
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: users[0],
        message: 'User found successfully'
      };
    } catch (error) {
      console.error('Get user by email error:', error);
      return {
        success: false,
        message: 'Failed to get user'
      };
    }
  }

  async getUserById(id: number): Promise<ServiceResponse<UserData>> {
    try {
      const [userRows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      const users = userRows as UserData[];
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: users[0],
        message: 'User found successfully'
      };
    } catch (error) {
      console.error('Get user by id error:', error);
      return {
        success: false,
        message: 'Failed to get user'
      };
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'company' | 'manager' | 'vehicle_owner' | 'driver';
    phone?: string;
  }): Promise<ServiceResponse<UserData>> {
    try {
      // Check if user already exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if ((existingUsers as any[]).length > 0) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      const [result] = await db.execute(
        `INSERT INTO users
         (email, password, name, role, phone, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          userData.email,
          hashedPassword,
          userData.name,
          userData.role,
          userData.phone || null
        ]
      );

      const insertId = (result as any).insertId;

      // Get created user
      return await this.getUserById(insertId);
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: 'Failed to create user'
      };
    }
  }

  async updateUser(id: number, userData: Partial<{
    email: string;
    name: string;
    phone: string;
    status: 'active' | 'inactive';
  }>): Promise<ServiceResponse<UserData>> {
    try {
      // Build update query dynamically
      const updateFields: string[] = [];
      const params: any[] = [];

      if (userData.email) {
        updateFields.push('email = ?');
        params.push(userData.email);
      }
      if (userData.name) {
        updateFields.push('name = ?');
        params.push(userData.name);
      }
      if (userData.phone !== undefined) {
        updateFields.push('phone = ?');
        params.push(userData.phone);
      }
      if (userData.status) {
        updateFields.push('status = ?');
        params.push(userData.status);
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
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get updated user
      return await this.getUserById(id);
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: 'Failed to update user'
      };
    }
  }

  async deleteUser(id: number): Promise<ServiceResponse<null>> {
    try {
      const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: 'Failed to delete user'
      };
    }
  }

  async getAllUsers(filters?: {
    role?: string;
    status?: string;
  }): Promise<ServiceResponse<UserData[]>> {
    try {
      let query = 'SELECT * FROM users';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.role) {
        conditions.push('role = ?');
        params.push(filters.role);
      }

      if (filters?.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.execute(query, params);
      const users = rows as UserData[];

      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        message: 'Failed to get users'
      };
    }
  }

  async verifyToken(token: string): Promise<ServiceResponse<any>> {
    try {
      // Try to verify with company secret first, then admin secret
      let decoded: any;
      let secretUsed: string;

      try {
        // Try company secret first
        decoded = jwt.verify(token, process.env.JWT_COMPANY_SECRET || process.env.JWT_SECRET || 'default-secret');
        secretUsed = 'company';
      } catch (companyError) {
        try {
          // Try admin secret
          decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
          secretUsed = 'admin';
        } catch (adminError) {
          return {
            success: false,
            error: 'Invalid token'
          };
        }
      }

      return {
        success: true,
        data: {
          ...decoded,
          tokenType: secretUsed
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }
}
