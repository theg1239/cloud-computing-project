import { Lab } from '@/types/models';

export const labs: Lab[] = [
  {
    id: 'lab-cs-101',
    name: 'SMEC Computer Lab 1',
    location: 'SMEC Block, Room 101',
    capacity: 30,
    status: 'OPEN',
    equipmentIds: ['eq-osc-1', 'eq-psu-1', 'eq-3dp-1'],
  },
  {
    id: 'lab-elec-201',
    name: 'Electronics Lab',
    location: 'SMEC Block, Room 201',
    capacity: 24,
    status: 'OPEN',
    equipmentIds: ['eq-osc-2', 'eq-psu-2'],
  },
  {
    id: 'lab-mech-301',
    name: 'Mechanical Workshop',
    location: 'SMEC Block, Room 301',
    capacity: 20,
    status: 'CLOSED',
    equipmentIds: ['eq-cnc-1'],
  },
];
