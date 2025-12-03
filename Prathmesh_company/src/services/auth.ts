// Authentication service for handling tokens and API calls
import API_CONFIG, { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './config';

class AuthService {
  private static BASE_URL = API_CONFIG.BASE_URL;

  // Check if we're in browser environment
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Login user
  static async login(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        if (this.isBrowser()) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.data.user));
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Signup user
  static async signup(email: string, password: string, name: string, phone: string, role: string = 'company', companyData: any) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone, role, companyData }),
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        if (this.isBrowser()) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.data.user));
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Logout user
  static logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  // Get stored token
  static getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Get stored user
  static getUser() {
    if (!this.isBrowser()) {
      return null;
    }
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const token = this.getToken();
    return !!token;
  }

  // API call with authentication
  static async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle unauthorized responses
      if (response.status === 401) {
        this.logout();
        if (this.isBrowser()) {
          window.location.href = '/login';
        }
        return { success: false, error: 'Unauthorized' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // GET request with auth
  static async get(endpoint: string): Promise<any> {
    return this.apiCall(endpoint, { method: 'GET' });
  }

  // POST request with auth
  static async post(endpoint: string, data: any): Promise<any> {
    return this.apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request with auth
  static async put(endpoint: string, data: any): Promise<any> {
    return this.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request with auth
  static async delete(endpoint: string): Promise<any> {
    return this.apiCall(endpoint, { method: 'DELETE' });
  }

  // PATCH request with auth
  static async patch(endpoint: string, data: any): Promise<any> {
    return this.apiCall(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export default AuthService;
