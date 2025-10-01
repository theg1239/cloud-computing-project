import { Equipment } from '@/types/models';

export const equipment: Equipment[] = [
  { id: 'eq-osc-1', labId: 'lab-cs-101', name: 'Oscilloscope Tektronix', type: 'Oscilloscope', status: 'AVAILABLE', serialNumber: 'TX-OSC-1001' },
  { id: 'eq-psu-1', labId: 'lab-cs-101', name: 'DC Power Supply Keysight', type: 'Power Supply', status: 'IN_USE', serialNumber: 'KG-PSU-5581' },
  { id: 'eq-3dp-1', labId: 'lab-cs-101', name: 'Prusa i3 MK3S+', type: '3D Printer', status: 'UNDER_MAINTENANCE', serialNumber: 'PRUSA-22-901' },
  { id: 'eq-osc-2', labId: 'lab-elec-201', name: 'Rigol DS1054Z', type: 'Oscilloscope', status: 'AVAILABLE', serialNumber: 'RG-OSC-5540' },
  { id: 'eq-psu-2', labId: 'lab-elec-201', name: 'DC Power Supply Mastech', type: 'Power Supply', status: 'AVAILABLE', serialNumber: 'MS-PSU-2201' },
  { id: 'eq-cnc-1', labId: 'lab-mech-301', name: 'CNC Milling Machine', type: 'CNC', status: 'UNDER_MAINTENANCE', serialNumber: 'CNC-MECH-0003' },
];
