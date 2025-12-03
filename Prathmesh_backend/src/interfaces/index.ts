// User interfaces
export interface IUser {
  id?: number;
  email: string;
  password: string;
  role: 'admin' | 'company' | 'manager' | 'vehicle_owner' | 'driver';
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

// Company interfaces
export interface ICompany {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

// Vehicle Owner interfaces
export interface IVehicleOwner {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  fleetSize: number;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

// Driver interfaces
export interface IDriver {
  id?: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleOwnerId: number;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

// Manager interfaces
export interface IManager {
  id?: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

// Trip interfaces
export interface ITrip {
  id?: number;
  tripId: string;
  companyId: number;
  companyName?: string;
  pickupLocation: string;
  dropLocation: string;
  oilType: string;
  quantity: number;
  vehicleType: string;
  status: 'pending' | 'confirmed' | 'vehicle_assigned' | 'driver_assigned' | 'in_transit' | 'completed' | 'cancelled';
  assignedVehicle?: string;
  driverName?: string;
  driverPhone?: string;
  startDate?: Date;
  endDate?: Date;
  totalCost?: number;
  estimatedCost?: number;
  expectedDate?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Document interfaces
export interface IDocument {
  id?: number;
  tripId: number;
  type: 'empty-tanker-slip' | 'loading-slip' | 'delivery-receipt' | 'gate-pass' | 'weighbridge-slip';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: 'driver' | 'manager' | 'admin';
  uploadedAt?: Date;
}

// Payment interfaces
export interface IPayment {
  id?: number;
  tripId: number;
  companyId: number;
  vehicleOwnerId: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentDate?: Date;
  transactionId?: string;
  paymentMethod?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Request/Response interfaces for API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
    name: string;
    phone?: string;
    status: string;
    companyId?: number | null;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Query interfaces
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TripQuery extends PaginationQuery {
  status?: string;
  company_id?: number;
  vehicle_owner_id?: number;
  startDate?: Date;
  endDate?: Date;
}

// Service response interfaces
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
