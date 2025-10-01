import { Notification } from '@/types/models';

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const notifications: Notification[] = [
  {
    id: 'nt-1',
    userId: 'u-tech-1',
    type: 'MAINTENANCE',
    message: 'New maintenance ticket mt-2 assigned to you',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 5)),
    read: false,
    relatedId: 'mt-2',
  },
  {
    id: 'nt-2',
    userId: 'u-stu-1',
    type: 'BOOKING',
    message: 'Your booking bk-1 is confirmed',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 20)),
    read: true,
    relatedId: 'bk-1',
  },
];
