import { Booking } from '@/types/models';

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const bookings: Booking[] = [
  {
    id: 'bk-1',
    labId: 'lab-cs-101',
    userId: 'u-stu-1',
    equipmentIds: ['eq-osc-1'],
    startTime: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0)),
    endTime: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0)),
    purpose: 'Signal analysis experiment',
    status: 'CONFIRMED',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24)),
  },
  {
    id: 'bk-2',
    labId: 'lab-elec-201',
    userId: 'u-fac-1',
    equipmentIds: ['eq-psu-2'],
    startTime: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0)),
    endTime: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0)),
    purpose: 'Class lab session',
    status: 'CONFIRMED',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 2)),
  },
];
