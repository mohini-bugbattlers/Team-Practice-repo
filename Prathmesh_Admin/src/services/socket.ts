// Socket service for real-time notifications
class SocketService {
  private socket: any = null;
  private isConnected: boolean = false;
  private eventCallbacks: Map<string, Function[]> = new Map();

  connect(userId: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    // For demo purposes, we'll simulate socket connection
    // In production, replace with actual Socket.IO client
    this.socket = {
      emit: (event: string, data: any) => {
        console.log('Socket emit:', event, data);
        this.triggerEvent(event, data);
      },
      on: (event: string, callback: Function) => {
        console.log('Socket listener registered for:', event);
        if (!this.eventCallbacks.has(event)) {
          this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event)?.push(callback);
      },
      disconnect: () => {
        console.log('Socket disconnected');
        this.eventCallbacks.clear();
      }
    };

    this.isConnected = true;

    // Simulate joining user room
    this.socket.emit('join-user-room', userId);
  }

  private triggerEvent(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Simulate receiving notifications
  simulateNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (this.socket) {
      this.socket.emit('notification', {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  // In real implementation, this would be handled by the actual socket listener
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Listen for trip updates
  onTripUpdate(callback: (tripData: any) => void) {
    if (this.socket) {
      this.socket.on('trip-update', callback);
    }
  }

  // Listen for user updates
  onUserUpdate(callback: (userData: any) => void) {
    if (this.socket) {
      this.socket.on('user-update', callback);
    }
  }

  // Simulate trip update
  simulateTripUpdate(tripData: any) {
    if (this.socket) {
      this.socket.emit('trip-update', tripData);
    }
  }

  // Simulate user update
  simulateUserUpdate(userData: any) {
    if (this.socket) {
      this.socket.emit('user-update', userData);
    }
  }
}

export const socketService = new SocketService();
