import db from '../config/mysql';
import { ServiceResponse, PaginationQuery } from '@/interfaces';

interface PaymentData {
  id?: string;
  trip_id: number;
  company_id: number;
  vehicle_owner_id: number;
  amount: number;
  service_charge: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_date?: string;
  due_date: string;
  transaction_id?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  companyName?: string;
  vehicleOwnerName?: string;
  tripNumber?: string;
  route?: string;
}

export class PaymentService {
  async createPayment(paymentData: {
    trip_id: number;
    company_id: number;
    vehicle_owner_id: number;
    amount: number;
    payment_method?: string;
    transaction_id?: string;
  }): Promise<ServiceResponse<PaymentData>> {
    try {
      // Check if trip exists
      const [tripRows] = await db.execute('SELECT id FROM trips WHERE id = ?', [paymentData.trip_id]);
      if ((tripRows as any[]).length === 0) {
        return {
          success: false,
          message: 'Trip not found'
        };
      }

      // Check if company exists
      const [companyRows] = await db.execute('SELECT id FROM companies WHERE id = ?', [paymentData.company_id]);
      if ((companyRows as any[]).length === 0) {
        return {
          success: false,
          message: 'Company not found'
        };
      }

      // Check if vehicle owner exists
      const [vehicleOwnerRows] = await db.execute('SELECT id FROM vehicle_owners WHERE id = ?', [paymentData.vehicle_owner_id]);
      if ((vehicleOwnerRows as any[]).length === 0) {
        return {
          success: false,
          message: 'Vehicle owner not found'
        };
      }

      // Insert payment record with correct column names
      const [result] = await db.execute(
        `INSERT INTO payments
         (id, trip_id, company_id, vehicle_owner_id, amount, service_charge, total_amount, status, payment_date, due_date, transaction_id, payment_method, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NULL, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, NOW(), NOW())`,
        [
          `PAY-${Date.now()}`,
          paymentData.trip_id,
          paymentData.company_id,
          paymentData.vehicle_owner_id,
          paymentData.amount,
          0, // service_charge - can be updated later
          paymentData.amount, // total_amount
          paymentData.transaction_id || null,
          paymentData.payment_method || 'offline'
        ]
      );

      const insertId = (result as any).insertId;

      // Fetch the created payment
      const [paymentRows] = await db.execute(
        `SELECT p.*, t.route, t.trip_number, c.name as companyName, vo.name as vehicleOwnerName
         FROM payments p
         LEFT JOIN trips t ON p.trip_id = t.id
         LEFT JOIN companies c ON p.company_id = c.id
         LEFT JOIN vehicle_owners vo ON p.vehicle_owner_id = vo.id
         WHERE p.id = ?`,
        [insertId]
      );

      const payment = (paymentRows as any[])[0];

      return {
        success: true,
        data: payment,
        message: 'Payment record created successfully'
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment'
      };
    }
  }

  async getAllPayments(filters?: {
    status?: string;
    company_id?: number;
    vehicle_owner_id?: number;
    trip_id?: number;
  }): Promise<ServiceResponse<PaymentData[]>> {
    try {
      let query = `
        SELECT p.*, t.route, t.trip_number, c.name as companyName, vo.name as vehicleOwnerName
        FROM payments p
        LEFT JOIN trips t ON p.trip_id = t.id
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN vehicle_owners vo ON p.vehicle_owner_id = vo.id
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.status) {
        conditions.push('p.status = ?');
        params.push(filters.status);
      }

      if (filters?.company_id) {
        conditions.push('p.company_id = ?');
        params.push(filters.company_id);
      }

      if (filters?.vehicle_owner_id) {
        conditions.push('p.vehicle_owner_id = ?');
        params.push(filters.vehicle_owner_id);
      }

      if (filters?.trip_id) {
        conditions.push('p.trip_id = ?');
        params.push(filters.trip_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY p.created_at DESC';

      const [rows] = await db.execute(query, params);
      const payments = rows as PaymentData[];

      return {
        success: true,
        data: payments,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return {
        success: false,
        message: 'Failed to fetch payments'
      };
    }
  }

  async getPaymentById(id: string): Promise<ServiceResponse<PaymentData>> {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, t.route, t.trip_number, c.name as companyName, vo.name as vehicleOwnerName
         FROM payments p
         LEFT JOIN trips t ON p.trip_id = t.id
         LEFT JOIN companies c ON p.company_id = c.id
         LEFT JOIN vehicle_owners vo ON p.vehicle_owner_id = vo.id
         WHERE p.id = ?`,
        [id]
      );

      const payment = (rows as any[])[0];

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      return {
        success: true,
        data: payment,
        message: 'Payment retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      return {
        success: false,
        message: 'Failed to fetch payment'
      };
    }
  }

  async updatePaymentStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    transaction_id?: string
  ): Promise<ServiceResponse<PaymentData>> {
    try {
      let query = 'UPDATE payments SET status = ?, updated_at = NOW()';
      const params: any[] = [status];

      if (transaction_id) {
        query += ', transaction_id = ?';
        params.push(transaction_id);
      }

      if (status === 'completed') {
        query += ', payment_date = NOW()';
      }

      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await db.execute(query, params);

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      // Fetch updated payment
      return await this.getPaymentById(id);
    } catch (error) {
      console.error('Error updating payment status:', error);
      return {
        success: false,
        message: 'Failed to update payment status'
      };
    }
  }

  async deletePayment(id: number): Promise<ServiceResponse<null>> {
    try {
      const [result] = await db.execute('DELETE FROM payments WHERE id = ?', [id]);

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'Payment deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return {
        success: false,
        message: 'Failed to delete payment'
      };
    }
  }

  async getPaymentStats(): Promise<ServiceResponse<any>> {
    try {
      // Get status counts and totals
      const [statsRows] = await db.execute(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(amount) as totalAmount
        FROM payments
        GROUP BY status
      `);

      // Get overall totals
      const [totalRows] = await db.execute(`
        SELECT
          COUNT(*) as totalPayments,
          SUM(amount) as totalAmount,
          AVG(amount) as averageAmount
        FROM payments
      `);

      const stats = statsRows as any[];
      const totals = (totalRows as any[])[0];

      return {
        success: true,
        data: {
          stats,
          totalPayments: totals.totalPayments || 0,
          totalAmount: parseFloat(totals.totalAmount) || 0,
          averageAmount: parseFloat(totals.averageAmount) || 0
        },
        message: 'Payment statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return {
        success: false,
        message: 'Failed to fetch payment statistics'
      };
    }
  }
}
