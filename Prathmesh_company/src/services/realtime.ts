import { io, Socket } from 'socket.io-client';
import API_CONFIG from './config';

interface RealtimeEvent {
  type: 'trip_update' | 'payment_update' | 'notification' | 'driver_location' | 'system_alert';
  data: any;
  timestamp: string;
}

interface TripUpdate {
  tripId: number;
  status: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedArrival?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(API_CONFIG.BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to realtime server');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from realtime server:', reason);
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection_error', { error, attempt: this.reconnectAttempts });
    });

    // Real-time event listeners
    this.socket.on('trip_update', (data: TripUpdate) => {
      this.emit('trip_update', data);
    });

    this.socket.on('payment_update', (data: any) => {
      this.emit('payment_update', data);
    });

    this.socket.on('notification', (data: NotificationData) => {
      this.emit('notification', data);
    });

    this.socket.on('driver_location', (data: any) => {
      this.emit('driver_location', data);
    });

    this.socket.on('system_alert', (data: any) => {
      this.emit('system_alert', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Send events to server
  emitTripUpdate(tripId: number, update: Partial<TripUpdate>) {
    if (this.socket?.connected) {
      this.socket.emit('trip_update', { tripId, ...update });
    }
  }

  emitNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>) {
    if (this.socket?.connected) {
      this.socket.emit('send_notification', notification);
    }
  }

  // Join specific rooms for targeted updates
  joinCompanyRoom(companyId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_company_room', companyId);
    }
  }

  leaveCompanyRoom(companyId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_company_room', companyId);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new RealtimeService();
