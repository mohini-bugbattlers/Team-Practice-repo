import { IQuote, CreateQuoteRequest, ServiceResponse } from '../interfaces';
import db from '../config/mysql';

export class QuoteService {
  async createQuote(quoteData: CreateQuoteRequest): Promise<ServiceResponse<IQuote>> {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'from_location', 'to_location', 'product_type', 'quantity', 'unit'];
      for (const field of requiredFields) {
        if (!quoteData[field as keyof CreateQuoteRequest]) {
          return {
            success: false,
            error: `${field.replace('_', ' ')} is required`
          };
        }
      }

      // Insert quote into database
      const query = `
        INSERT INTO quotes (
          name, email, phone, company, from_location, to_location, 
          product_type, quantity, unit, message, preferred_contact_method, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      const values = [
        quoteData.name,
        quoteData.email,
        quoteData.phone,
        quoteData.company || null,
        quoteData.from_location,
        quoteData.to_location,
        quoteData.product_type,
        quoteData.quantity,
        quoteData.unit,
        quoteData.message || null,
        quoteData.preferred_contact_method || null
      ];

      const [result] = await db.execute(query, values);
      const insertId = (result as any).insertId;

      // Fetch the created quote
      const fetchQuery = `
        SELECT 
          id, name, email, phone, company, from_location, to_location,
          product_type, quantity, unit, message, preferred_contact_method,
          status, created_at, updated_at
        FROM quotes
        WHERE id = ?
      `;

      const [quoteResult] = await db.execute(fetchQuery, [insertId]);
      const quote = (quoteResult as any[])[0];

      return {
        success: true,
        data: quote as IQuote,
        message: 'Quote request submitted successfully'
      };
    } catch (error) {
      console.error('Error creating quote:', error);
      return {
        success: false,
        error: 'Failed to submit quote request'
      };
    }
  }

  async getAllQuotes(): Promise<ServiceResponse<IQuote[]>> {
    try {
      const query = `
        SELECT 
          id, name, email, phone, company, from_location, to_location,
          product_type, quantity, unit, message, preferred_contact_method,
          status, created_at, updated_at
        FROM quotes
        ORDER BY created_at DESC
      `;

      const [quotes] = await db.execute(query);

      return {
        success: true,
        data: quotes as IQuote[]
      };
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return {
        success: false,
        error: 'Failed to fetch quotes'
      };
    }
  }

  async updateQuoteStatus(id: number, status: string): Promise<ServiceResponse<IQuote>> {
    try {
      const validStatuses = ['pending', 'contacted', 'quoted', 'closed'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          error: 'Invalid status'
        };
      }

      const query = `
        UPDATE quotes 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [status, id]);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Quote not found'
        };
      }

      // Fetch updated quote
      const fetchQuery = `
        SELECT 
          id, name, email, phone, company, from_location, to_location,
          product_type, quantity, unit, message, preferred_contact_method,
          status, created_at, updated_at
        FROM quotes
        WHERE id = ?
      `;

      const [quoteResult] = await db.execute(fetchQuery, [id]);
      const quote = (quoteResult as any[])[0];

      return {
        success: true,
        data: quote as IQuote,
        message: 'Quote status updated successfully'
      };
    } catch (error) {
      console.error('Error updating quote status:', error);
      return {
        success: false,
        error: 'Failed to update quote status'
      };
    }
  }
}
