import { MaintenanceTicket } from '@/types/models';

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const maintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'mt-1',
    equipmentId: 'eq-3dp-1',
    labId: 'lab-cs-101',
    description: 'Nozzle clogging and inconsistent extrusion',
    reportedByUserId: 'u-stu-2',
    assignedToUserId: 'u-tech-1',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 48)),
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 30)),
    history: [
      { at: iso(new Date(now.getTime() - 1000 * 60 * 60 * 36)), note: 'Acknowledged issue', byUserId: 'u-tech-1' },
      { at: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24)), note: 'Disassembled and cleaned hotend', byUserId: 'u-tech-1' },
    ],
  },
  {
    id: 'mt-2',
    equipmentId: 'eq-cnc-1',
    labId: 'lab-mech-301',
    description: 'Spindle vibration above threshold',
    reportedByUserId: 'u-fac-1',
    status: 'OPEN',
    priority: 'MEDIUM',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
  },
];
