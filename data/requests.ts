import { EquipmentRequest } from '@/types/models';

export const equipmentRequests: EquipmentRequest[] = [
  {
    id: 'req-1',
    name: 'Soldering Station',
    type: 'Tool',
    reason: 'Needed for PCB prototyping lab',
    requestedByUserId: 'u-fac-1',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];
