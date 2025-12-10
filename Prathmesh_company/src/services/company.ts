import AuthService from './auth';
import API_CONFIG from './config';

export interface DashboardMetrics {
  totalRevenue: number;
  activeTrips: number;
  completedTrips: number;
  pendingPayments: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  monthlyGrowth: number;
  driverPerformance: {
    totalDrivers: number;
    activeDrivers: number;
    averageRating: number;
  };
  fleetUtilization: {
    totalVehicles: number;
    activeVehicles: number;
    utilizationRate: number;
  };
}

export interface TripAnalytics {
  dailyTrips: Array<{
    date: string;
    trips: number;
    revenue: number;
  }>;
  routePerformance: Array<{
    route: string;
    trips: number;
    averageTime: number;
    revenue: number;
  }>;
  materialStats: Array<{
    type: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface PaymentAnalytics {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  pendingPayments: Array<{
    tripId: number;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  companyType: string;
  businessLicense: string;
  establishedYear: number;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  billing: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    currency: string;
    timezone: string;
    language: string;
  };
}

export interface SystemAlert {
  id: string;
  type: 'system' | 'trip' | 'payment' | 'driver' | 'vehicle';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  actionRequired: boolean;
  metadata?: any;
}

class CompanyService {
  // Dashboard Analytics
  static async getDashboardMetrics(): Promise<{ success: boolean; data?: DashboardMetrics; error?: string }> {
    try {
      const response = await AuthService.get('/company/dashboard/metrics');
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch dashboard metrics' };
    }
  }

  static async getTripAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{ success: boolean; data?: TripAnalytics; error?: string }> {
    try {
      const response = await AuthService.get(`/company/analytics/trips?period=${period}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch trip analytics' };
    }
  }

  static async getPaymentAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{ success: boolean; data?: PaymentAnalytics; error?: string }> {
    try {
      const response = await AuthService.get(`/company/analytics/payments?period=${period}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch payment analytics' };
    }
  }

  // Notifications
  static async getNotifications(unreadOnly: boolean = false): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    try {
      const endpoint = `/company/notifications${unreadOnly ? '?unread=true' : ''}`;
      const response = await AuthService.get(endpoint);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch notifications' };
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await AuthService.patch(`/company/notifications/${notificationId}/read`, {});
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  static async markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await AuthService.patch('/company/notifications/read-all', {});
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }

  static async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = `/company/notifications/${notificationId}`;
      const response = await AuthService.delete(endpoint);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to delete notification' };
    }
  }

  // Company Profile
  static async getCompanyProfile(): Promise<{ success: boolean; data?: CompanyProfile; error?: string }> {
    try {
      const response = await AuthService.get('/company/profile');
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch company profile' };
    }
  }

  static async updateCompanyProfile(profileData: Partial<CompanyProfile>): Promise<{ success: boolean; data?: CompanyProfile; error?: string }> {
    try {
      const response = await AuthService.put('/company/profile', profileData);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to update company profile' };
    }
  }

  static async uploadCompanyDocument(documentType: string, file: File): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);

      const token = AuthService.getToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/company/profile/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to upload document' };
    }
  }

  // System Alerts
  static async getSystemAlerts(): Promise<{ success: boolean; data?: SystemAlert[]; error?: string }> {
    try {
      const response = await AuthService.get('/company/alerts');
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch system alerts' };
    }
  }

  static async resolveAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await AuthService.patch(`/company/alerts/${alertId}/resolve`, {});
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to resolve alert' };
    }
  }

  // Reports
  static async generateTripReport(filters: {
    startDate: string;
    endDate: string;
    status?: string;
    materialType?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await AuthService.post('/company/reports/trips', filters);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to generate trip report' };
    }
  }

  static async generatePaymentReport(filters: {
    startDate: string;
    endDate: string;
    status?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await AuthService.post('/company/reports/payments', filters);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to generate payment report' };
    }
  }

  // Settings
  static async updatePreferences(preferences: Partial<CompanyProfile['preferences']>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await AuthService.put('/company/preferences', preferences);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await AuthService.post('/company/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Fleet Management
  static async getFleetOverview(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await AuthService.get('/company/fleet');
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch fleet overview' };
    }
  }

  // Driver Management
  static async getDriverPerformance(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await AuthService.get('/company/drivers/performance');
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to fetch driver performance' };
    }
  }
}

export default CompanyService;
