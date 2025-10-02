export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'TECHNICIAN';

export type LabStatus = 'OPEN' | 'CLOSED';
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DocumentType = 'REPORT' | 'RESULT' | 'SOP';
export type NotificationType = 'MAINTENANCE' | 'BOOKING' | 'SYSTEM' | 'BOOKING_REQUEST' | 'BOOKING_APPROVED' | 'BOOKING_REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarUrl?: string;
}

export interface Lab {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: LabStatus;
  equipmentIds: string[];
}

export interface Equipment {
  id: string;
  labId: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  serialNumber?: string;
  purchasedOn?: string; // ISO date
}

export interface Booking {
  id: string;
  labId: string;
  userId: string;
  equipmentIds?: string[];
  startTime: string; // ISO date
  endTime: string; // ISO date
  purpose?: string;
  status: BookingStatus;
  approvedBy?: string;
  approvedAt?: string; // ISO date
  createdAt: string; // ISO date
}

export interface MaintenanceTicket {
  id: string;
  equipmentId: string;
  labId: string;
  description: string;
  reportedByUserId: string;
  assignedToUserId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  history?: Array<{ at: string; note: string; byUserId?: string }>; // simple audit log
}

export interface DocumentRef {
  id: string;
  type: DocumentType;
  title: string;
  url: string; // placeholder/local path for now
  version: number;
  uploadedByUserId: string;
  uploadedAt: string; // ISO date
}

export interface Experiment {
  id: string;
  labId: string;
  createdByUserId: string;
  title: string;
  description?: string;
  createdAt: string;
  documents: DocumentRef[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  relatedId?: string; // bookingId, ticketId, etc.
  metadata?: string; // JSON string with additional context
}

export interface EquipmentRequest {
  id: string;
  name: string;
  type: string;
  reason?: string;
  requestedByUserId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

// Generic API types
export type ID = string;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
