import { boolean, integer, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 32 }).notNull().unique(), // ADMIN, FACULTY, STUDENT, TECHNICIAN
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 180 }).notNull().unique(),
  department: varchar('department', { length: 120 }),
  roleName: varchar('role_name', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const labs = pgTable('labs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  capacity: integer('capacity').notNull().default(0),
  status: varchar('status', { length: 16 }).notNull().default('OPEN'),
});

export const equipment = pgTable('equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  labId: uuid('lab_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  status: varchar('status', { length: 24 }).notNull().default('AVAILABLE'),
  serialNumber: varchar('serial_number', { length: 120 }),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  labId: uuid('lab_id').notNull(),
  userId: uuid('user_id').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  purpose: text('purpose'),
  status: varchar('status', { length: 24 }).notNull().default('PENDING'),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pre-generated, queryable time slots per lab
export const labSchedules = pgTable('lab_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  labId: uuid('lab_id').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 24 }).notNull().default('AVAILABLE'), // AVAILABLE | BOOKED
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').notNull(),
  labId: uuid('lab_id').notNull(),
  description: text('description').notNull(),
  reportedByUserId: uuid('reported_by_user_id').notNull(),
  assignedToUserId: uuid('assigned_to_user_id'),
  status: varchar('status', { length: 24 }).notNull().default('OPEN'),
  priority: varchar('priority', { length: 24 }).notNull().default('MEDIUM'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const experiments = pgTable('experiments', {
  id: uuid('id').defaultRandom().primaryKey(),
  labId: uuid('lab_id').notNull(),
  createdByUserId: uuid('created_by_user_id').notNull(),
  title: varchar('title', { length: 240 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').notNull(),
  type: varchar('type', { length: 24 }).notNull(),
  title: varchar('title', { length: 240 }).notNull(),
  url: text('url').notNull(),
  version: integer('version').notNull().default(1),
  uploadedByUserId: uuid('uploaded_by_user_id').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  type: varchar('type', { length: 24 }).notNull(),
  message: text('message').notNull(),
  relatedId: uuid('related_id'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  read: boolean('read').notNull().default(false),
});

export const authSessions = pgTable('auth_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
