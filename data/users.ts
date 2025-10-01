import { User } from '@/types/models';

export const users: User[] = [
  { id: 'u-admin-1', name: 'Admin User', email: 'admin@smec.vit.ac.in', role: 'ADMIN', department: 'SMEC' },
  { id: 'u-fac-1', name: 'Dr. Kavitha', email: 'kavitha@vit.ac.in', role: 'FACULTY', department: 'SMEC' },
  { id: 'u-stu-1', name: 'Ishaan Samdani', email: 'ishaan.sam@vit.ac.in', role: 'STUDENT', department: 'SMEC' },
  { id: 'u-stu-2', name: 'Ayush Kumar', email: 'ayush.kumar@vit.ac.in', role: 'STUDENT', department: 'SMEC' },
  { id: 'u-tech-1', name: 'Suhaib Rumi', email: 'suhaib.rumi@vit.ac.in', role: 'TECHNICIAN', department: 'SMEC' },
];

export const findUser = (id: string) => users.find((u) => u.id === id);
