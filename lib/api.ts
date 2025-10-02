import { api as mock } from '@/lib/mockApi';
import { Booking, DocumentRef, DocumentType, Equipment, Experiment, Lab, MaintenanceTicket, Notification, User } from '@/types/models';
import { API_URL, gqlRequest, restPost, restPostMaybe, setAuthToken } from './http';

const isServerEnabled = !!API_URL;

export const api = {
  // Auth
  async loginWithEmail(email: string): Promise<User> {
    if (!isServerEnabled) return mock.loginWithEmail(email);
    // Try login and return a special error if not found
    const res = await restPostMaybe<User>('/auth/login', { email });
    if (res.ok && res.data) {
      const user = res.data as any;
      setAuthToken(email);
      return { id: user.id, name: user.name, email: user.email, role: user.roleName, department: user.department };
    }
    if (res.status === 404) {
      const err: any = new Error('USER_NOT_FOUND');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    throw new Error(typeof res.error === 'string' ? res.error : res.error?.error || 'Login failed');
  },
  async register(input: { email: string; name: string; roleName: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'TECHNICIAN'; department?: string }): Promise<User> {
    if (!isServerEnabled) {
      // mimic server by creating or returning mock user
      const u = await mock.loginWithEmail(input.email).catch(() => null as any);
      if (u) return u;
      // No mock register path; just synthesize a user
      return {
        id: `u-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: input.roleName,
        department: input.department,
      } as any;
    }
    const created = await restPost<User>('/auth/register', input);
    setAuthToken(input.email);
    const u: any = created;
    return { id: u.id, name: u.name, email: u.email, role: u.roleName, department: u.department };
  },
  async quickPick(userId: string): Promise<User> {
    if (!isServerEnabled) {
      const u = await mock.getUserById(userId);
      if (!u) throw new Error('User not found');
      return u;
    }
    setAuthToken(userId);
    const data = await gqlRequest<{ me: User }>(`query { me { id name email roleName department } }`);
    const me = data.me as any;
    if (!me) throw new Error('Unauthorized');
    return { id: me.id, name: me.name, email: me.email, role: me.roleName, department: me.department };
  },
  // Data
  async listLabs(): Promise<Lab[]> {
    if (!isServerEnabled) return mock.listLabs();
    const data = await gqlRequest<{ labs: Array<{ id: string; name: string; location: string; capacity: number; status: string }> }>(
      `query { labs { id name location capacity status } }`
    );
    return data.labs.map((l) => ({ ...l, equipmentIds: [] })) as any;
  },
  async listEquipment(labId?: string): Promise<Equipment[]> {
    if (!isServerEnabled) return labId ? mock.listEquipmentByLab(labId) : mock.listEquipment();
    const data = await gqlRequest<{ equipment: Array<{ id: string; labId: string; name: string; type: string; status: string }> }>(
      `query($labId: ID) { equipment(labId: $labId) { id labId name type status } }`,
      { labId }
    );
    return data.equipment as any;
  },
  async getLabById(id: string) {
    if (!isServerEnabled) return mock.getLabById(id);
    const labs = await this.listLabs();
    return labs.find((l) => l.id === id);
  },
  async getUserById(id: string) {
    // No server endpoint yet; fallback to mock without changing current auth token
    return mock.getUserById(id);
  },
  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    if (!isServerEnabled) return mock.getEquipmentById(id);
    const items = await this.listEquipment();
    return items.find((e) => e.id === id);
  },
  async listMaintenance(): Promise<MaintenanceTicket[]> {
    if (!isServerEnabled) return mock.listMaintenance();
    try {
      const data = await gqlRequest<{ maintenanceTickets: MaintenanceTicket[] }>(
        `query { maintenanceTickets { id equipmentId labId description reportedByUserId assignedToUserId status priority createdAt updatedAt } }`
      );
      return data.maintenanceTickets as any;
    } catch (err: any) {
      const msg = (err?.message || '').toString().toLowerCase();
      if (msg.includes('forbidden') || msg.includes('unauthorized')) return [] as any;
      throw err;
    }
  },
  async listUsers(): Promise<User[]> {
    // No server endpoint yet; fallback
    return mock.listUsers();
  },
  async listExperiments(): Promise<Experiment[]> {
    if (!isServerEnabled) return mock.listExperiments();
    const data = await gqlRequest<{ experiments: any[] }>(
      `query { experiments { id labId createdByUserId title description createdAt documents { id type title url version uploadedByUserId uploadedAt } } }`
    );
    return data.experiments as any;
  },
  async uploadExperimentDocument(experimentId: string, input: { type: DocumentType; title: string; url?: string; uploadedByUserId: string }): Promise<DocumentRef> {
    if (!isServerEnabled) return mock.uploadExperimentDocument(experimentId, input);
    const data = await gqlRequest<{ uploadDocument: DocumentRef }>(
      `mutation($experimentId: ID!, $input: UploadDocumentInput!) { uploadDocument(experimentId: $experimentId, input: $input) { id type title url version uploadedByUserId uploadedAt } }`,
      { experimentId, input: { type: input.type, title: input.title, url: input.url } }
    );
    return data.uploadDocument as any;
  },
  async listBookings(): Promise<Booking[]> {
    // For now, prefer server myBookings query for current user context
    const data = await gqlRequest<{ myBookings: Booking[] }>(`query { myBookings { id labId userId startTime endTime purpose status createdAt } }`);
    return data.myBookings as any;
  },
  async createBooking(input: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    const data = await gqlRequest<{ createBooking: Booking }>(
      `mutation($input: CreateBookingInput!) { createBooking(input: $input) { id labId userId startTime endTime purpose status createdAt } }`,
      { input: { labId: input.labId, startTime: input.startTime, endTime: input.endTime, purpose: input.purpose } }
    );
    return data.createBooking as any;
  },
  async listBookingsByUser(userId: string): Promise<Booking[]> {
    // myBookings respects the auth token; ignore userId parameter on server
    const data = await gqlRequest<{ myBookings: Booking[] }>(`query { myBookings { id labId userId startTime endTime purpose status createdAt } }`);
    return data.myBookings as any;
  },
  async cancelBooking(id: string): Promise<void> {
    await gqlRequest<{ cancelBooking: boolean }>(`mutation($id: ID!) { cancelBooking(id: $id) }`, { id });
  },
  async listLabSchedules(labId: string, from?: string, to?: string) {
    const data = await gqlRequest<{ labSchedules: Array<{ id: string; labId: string; startTime: string; endTime: string; status: string }> }>(
      `query($labId: ID!, $from: String, $to: String) { labSchedules(labId: $labId, from: $from, to: $to) { id labId startTime endTime status } }`,
      { labId, from, to }
    );
    return data.labSchedules as any;
  },
  async reportMaintenance(input: Omit<MaintenanceTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> {
    return mock.reportMaintenance(input);
  },
  async assignMaintenance(id: string, userId: string): Promise<MaintenanceTicket> {
    return mock.assignMaintenance(id, userId);
  },
  async resolveMaintenance(id: string, note?: string): Promise<MaintenanceTicket> {
    return mock.resolveMaintenance(id, note);
  },
  async getMaintenanceById(id: string): Promise<MaintenanceTicket | undefined> {
    if (!isServerEnabled) return mock.getMaintenanceById(id);
    try {
      const data = await gqlRequest<{ maintenanceTicket: MaintenanceTicket | null }>(
        `query($id: ID!) { maintenanceTicket(id: $id) { id equipmentId labId description reportedByUserId assignedToUserId status priority createdAt updatedAt } }`,
        { id }
      );
      return (data.maintenanceTicket || undefined) as any;
    } catch (err: any) {
      const msg = (err?.message || '').toString().toLowerCase();
      if (msg.includes('forbidden') || msg.includes('unauthorized')) return undefined;
      throw err;
    }
  },
  async listNotifications(userId?: string): Promise<Notification[]> {
    if (!isServerEnabled) return mock.listNotifications(userId);
    try {
      const data = await gqlRequest<{ myNotifications: Notification[] }>(
        `query { myNotifications { id userId type message relatedId metadata createdAt read } }`
      );
      return data.myNotifications as any;
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      return [];
    }
  },
  async markNotificationRead(id: string): Promise<void> {
    if (!isServerEnabled) return mock.markNotificationRead(id);
    await gqlRequest<{ markNotificationRead: boolean }>(
      `mutation($id: ID!) { markNotificationRead(id: $id) }`,
      { id }
    );
  },
  async approveBooking(id: string): Promise<Booking> {
    const data = await gqlRequest<{ approveBooking: Booking }>(
      `mutation($id: ID!) { approveBooking(id: $id) { id labId userId startTime endTime purpose status approvedBy approvedAt createdAt } }`,
      { id }
    );
    return data.approveBooking as any;
  },
  async rejectBooking(id: string): Promise<Booking> {
    const data = await gqlRequest<{ rejectBooking: Booking }>(
      `mutation($id: ID!) { rejectBooking(id: $id) { id labId userId startTime endTime purpose status approvedBy approvedAt createdAt } }`,
      { id }
    );
    return data.rejectBooking as any;
  },
  async listPendingBookings(): Promise<Booking[]> {
    try {
      const data = await gqlRequest<{ pendingBookings: Booking[] }>(
        `query { pendingBookings { id labId userId startTime endTime purpose status approvedBy approvedAt createdAt } }`
      );
      return data.pendingBookings as any;
    } catch (err: any) {
      const msg = (err?.message || '').toString().toLowerCase();
      if (msg.includes('forbidden') || msg.includes('unauthorized')) return [];
      throw err;
    }
  },
  async uploadPDF(experimentId: string, input: { type: DocumentType; title: string; fileUri: string; fileName: string }): Promise<DocumentRef> {
    // For now, we'll store the fileUri directly. In production, you'd upload to cloud storage first
    const cloudUrl = input.fileUri; // This would be replaced with actual cloud storage URL
    return this.uploadExperimentDocument(experimentId, {
      type: input.type,
      title: input.title,
      url: cloudUrl,
      uploadedByUserId: 'current-user',
    });
  },
  async createEquipmentRequest(input: Parameters<typeof mock.createEquipmentRequest>[0]) {
    return mock.createEquipmentRequest(input);
  },
};
