import { useState, useEffect } from 'react';
import CompanyService, { DashboardMetrics, TripAnalytics, PaymentAnalytics, Notification } from '@/services/company';
import RealtimeService from '@/services/realtime';
import AuthService from '@/services/auth';

interface UseDashboardDataReturn {
  metrics: DashboardMetrics | null;
  tripAnalytics: TripAnalytics | null;
  paymentAnalytics: PaymentAnalytics | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  unreadCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tripAnalytics, setTripAnalytics] = useState<TripAnalytics | null>(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, tripsRes, paymentsRes, notificationsRes] = await Promise.all([
        CompanyService.getDashboardMetrics(),
        CompanyService.getTripAnalytics(),
        CompanyService.getPaymentAnalytics(),
        CompanyService.getNotifications(true),
      ]);

      if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
      if (tripsRes.success && tripsRes.data) setTripAnalytics(tripsRes.data);
      if (paymentsRes.success && paymentsRes.data) setPaymentAnalytics(paymentsRes.data);
      if (notificationsRes.success) setNotifications(notificationsRes.data || []);

    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  const markNotificationRead = async (id: string) => {
    try {
      await CompanyService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchDashboardData();

    // Setup real-time connection
    const token = AuthService.getToken();
    const user = AuthService.getUser();
    
    if (token && user) {
      RealtimeService.connect(token);
      RealtimeService.joinCompanyRoom(user.id);

      RealtimeService.on('connection_status', ({ connected }: { connected: boolean }) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      });

      RealtimeService.on('connection_error', ({ error }: { error: any }) => {
        console.error('Realtime connection error:', error);
        setConnectionStatus('disconnected');
      });

      RealtimeService.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      RealtimeService.on('trip_update', (update: any) => {
        // Refresh metrics when trip status changes
        fetchDashboardData();
      });

      RealtimeService.on('payment_update', (update: any) => {
        // Refresh payment analytics when payment status changes
        fetchDashboardData();
      });

      return () => {
        RealtimeService.disconnect();
      };
    }
  }, []);

  return {
    metrics,
    tripAnalytics,
    paymentAnalytics,
    notifications,
    loading,
    error,
    refreshData,
    markNotificationRead,
    unreadCount,
    connectionStatus,
  };
};
