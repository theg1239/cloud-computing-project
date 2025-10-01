import { bookings } from '@/data/bookings';
import { equipment } from '@/data/equipment';
import { experiments } from '@/data/experiments';
import { labs } from '@/data/labs';
import { maintenanceTickets } from '@/data/maintenance';
import { notifications } from '@/data/notifications';
import { equipmentRequests } from '@/data/requests';
import { users } from '@/data/users';
import { Booking, DocumentRef, DocumentType, Equipment, EquipmentRequest, Experiment, Lab, MaintenanceTicket, Notification, Paginated, User } from '@/types/models';

// Simulated network latency
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const api = {
  // Auth
  async loginWithEmail(email: string): Promise<User> {
    await delay();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account found for this email');
    return user;
  },
  async getUserById(id: string): Promise<User | undefined> {
    await delay(100);
    return users.find((u) => u.id === id);
  },
  // Basic getters
  async getOverviewCounts() {
    await delay();
    return {
      users: users.length,
      labs: labs.length,
      equipment: equipment.length,
      bookings: bookings.length,
      maintenance: maintenanceTickets.length,
      experiments: experiments.length,
      notifications: notifications.length,
    };
  },

  async listUsers(): Promise<User[]> {
    await delay();
    return users;
  },
  async listLabs(): Promise<Lab[]> {
    await delay();
    return labs;
  },
  async getLabById(id: string): Promise<Lab | undefined> {
    await delay(100);
    return labs.find((l) => l.id === id);
  },
  async listEquipment(): Promise<Equipment[]> {
    await delay();
    return equipment;
  },
  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    await delay(80);
    return equipment.find((e) => e.id === id);
  },
  async listEquipmentByLab(labId: string): Promise<Equipment[]> {
    await delay(100);
    return equipment.filter((e) => e.labId === labId);
  },
  async listBookings(): Promise<Booking[]> {
    await delay();
    return bookings;
  },
  async listBookingsByUser(userId: string): Promise<Booking[]> {
    await delay(100);
    return bookings.filter((b) => b.userId === userId);
  },
  async cancelBooking(id: string): Promise<void> {
    await delay(150);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    bookings[idx].status = 'CANCELLED';
  },
  async listMaintenance(): Promise<MaintenanceTicket[]> {
    await delay();
    return maintenanceTickets;
  },
  async listExperiments(): Promise<Experiment[]> {
    await delay();
    return experiments;
  },
  async uploadExperimentDocument(
    experimentId: string,
    input: { type: DocumentType; title: string; url?: string; uploadedByUserId: string }
  ): Promise<DocumentRef> {
    await delay(200);
    const ex = experiments.find((e) => e.id === experimentId);
    if (!ex) throw new Error('Experiment not found');
    const now = new Date().toISOString();
    // Versioning: increment if same title exists, else start at 1
    const sameTitleDocs = ex.documents.filter((d) => d.title === input.title);
    const nextVersion = sameTitleDocs.length ? Math.max(...sameTitleDocs.map((d) => d.version)) + 1 : 1;
    const created: DocumentRef = {
      id: `doc-${ex.documents.length + 1}`,
      type: input.type,
      title: input.title,
      url: input.url || `/docs/${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      version: nextVersion,
      uploadedByUserId: input.uploadedByUserId,
      uploadedAt: now,
    };
    ex.documents.push(created);
    return created;
  },
  async listNotifications(userId?: string): Promise<Notification[]> {
    await delay();
    return userId ? notifications.filter((n) => n.userId === userId) : notifications;
  },
  async markNotificationRead(id: string): Promise<void> {
    await delay(80);
    const n = notifications.find((x) => x.id === id);
    if (n) n.read = true;
  },

  // Create booking with simple clash prevention (same lab time overlap)
  async createBooking(input: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    await delay();
    const start = new Date(input.startTime).getTime();
    const end = new Date(input.endTime).getTime();
    if (end <= start) throw new Error('End time must be after start time');

    const overlaps = bookings.some((b) => {
      if (b.labId !== input.labId || b.status !== 'CONFIRMED') return false;
      const bs = new Date(b.startTime).getTime();
      const be = new Date(b.endTime).getTime();
      return Math.max(bs, start) < Math.min(be, end);
    });
    if (overlaps) throw new Error('Time slot overlaps with an existing booking');

    const created: Booking = {
      id: `bk-${bookings.length + 1}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      ...input,
    };
    bookings.push(created);
    return created;
  },

  async reportMaintenance(input: Omit<MaintenanceTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> {
    await delay();
    const created: MaintenanceTicket = {
      id: `mt-${maintenanceTickets.length + 1}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ at: new Date().toISOString(), note: 'Ticket created' }],
      ...input,
    };
    maintenanceTickets.push(created);
    return created;
  },
  async assignMaintenance(id: string, userId: string): Promise<MaintenanceTicket> {
    await delay(150);
    const t = maintenanceTickets.find((m) => m.id === id);
    if (!t) throw new Error('Ticket not found');
    t.assignedToUserId = userId;
    t.status = 'IN_PROGRESS';
    t.updatedAt = new Date().toISOString();
    t.history = t.history || [];
    t.history.push({ at: t.updatedAt, note: `Assigned to ${userId}` });
    return t;
  },
  async resolveMaintenance(id: string, note?: string): Promise<MaintenanceTicket> {
    await delay(150);
    const t = maintenanceTickets.find((m) => m.id === id);
    if (!t) throw new Error('Ticket not found');
    t.status = 'RESOLVED';
    t.updatedAt = new Date().toISOString();
    t.history = t.history || [];
    t.history.push({ at: t.updatedAt, note: note || 'Resolved' });
    return t;
  },
  async getMaintenanceById(id: string): Promise<MaintenanceTicket | undefined> {
    await delay(100);
    return maintenanceTickets.find((m) => m.id === id);
  },

  async paginate<T>(items: T[], page = 1, pageSize = 10): Promise<Paginated<T>> {
    await delay();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { items: items.slice(start, end), total: items.length, page, pageSize };
  },

  // Equipment requests
  async createEquipmentRequest(input: Omit<EquipmentRequest, 'id' | 'status' | 'createdAt'>): Promise<EquipmentRequest> {
    await delay(200);
    const created: EquipmentRequest = {
      id: `req-${equipmentRequests.length + 1}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...input,
    };
    equipmentRequests.push(created);
    return created;
  },
  async listEquipmentRequests(): Promise<EquipmentRequest[]> {
    await delay(120);
    return equipmentRequests;
  },
};
