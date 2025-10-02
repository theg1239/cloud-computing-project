import { serve } from '@hono/node-server';
import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import type { YogaInitialContext } from 'graphql-yoga';
import { createSchema, createYoga } from 'graphql-yoga';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { z } from 'zod';
import { authMiddleware, getUser } from './auth/middleware.js';
import { can } from './auth/rbac.js';
import { db } from './db/client.js';
import * as schema from './db/schema.js';

const app = new Hono();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-user'],
}));

app.get('/', (c) => c.json({ ok: true, name: 'cc-services' }));

// Public auth routes (email-based)
const EmailSchema = z.string().email();
const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  roleName: z.enum(['ADMIN', 'FACULTY', 'STUDENT', 'TECHNICIAN']).default('STUDENT'),
  department: z.string().optional(),
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = EmailSchema.safeParse(body?.email);
  if (!parsed.success) return c.json({ error: 'Invalid email' }, 400);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, parsed.data)).limit(1);
  const user = rows[0];
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});

app.post('/auth/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  const { email, name, roleName, department } = parsed.data;
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing[0]) return c.json(existing[0]);
  const inserted = await db.insert(schema.users).values({ email, name, roleName, department }).returning();
  return c.json(inserted[0]);
});

// Authenticated routes
const authed = new Hono();
authed.use('*', authMiddleware);

authed.get('/me', (c) => {
  return c.json({ user: getUser(c) || null });
});

authed.patch('/me', async (c) => {
  const u = getUser<any>(c);
  if (!u) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json().catch(() => ({}));
  const UpdateSchema = z.object({ name: z.string().min(1).optional(), department: z.string().optional() });
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  const values: any = {};
  if (parsed.data.name !== undefined) values.name = parsed.data.name;
  if (parsed.data.department !== undefined) values.department = parsed.data.department;
  if (!Object.keys(values).length) return c.json(u);
  const updated = await db.update(schema.users).set(values).where(eq(schema.users.id, u.id)).returning();
  return c.json(updated[0] || u);
});

authed.get('/labs', async (c) => {
  const u = getUser<any>(c);
  if (!u || !can(u.roleName, 'lab:view')) return c.json({ error: 'Forbidden' }, 403);
  const data = await db.select().from(schema.labs);
  return c.json(data);
});

authed.get('/equipment', async (c) => {
  const u = getUser<any>(c);
  if (!u || !can(u.roleName, 'equipment:view')) return c.json({ error: 'Forbidden' }, 403);
  const labId = c.req.query('labId');
  const data = labId
    ? await db.select().from(schema.equipment).where(eq(schema.equipment.labId, labId))
    : await db.select().from(schema.equipment);
  return c.json(data);
});

authed.get('/maintenance', async (c) => {
  const u = getUser<any>(c);
  if (!u || !can(u.roleName, 'maintenance:view')) return c.json({ error: 'Forbidden' }, 403);
  const data = await db.select().from(schema.maintenanceTickets);
  return c.json(data);
});

app.route('/api', authed);

// GraphQL schema and route
const gqlSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type User { id: ID!, name: String!, email: String!, roleName: String!, department: String }
    type Lab { id: ID!, name: String!, location: String!, capacity: Int!, status: String! }
    type Equipment { id: ID!, labId: ID!, name: String!, type: String!, status: String! }
      type LabSchedule { id: ID!, labId: ID!, startTime: String!, endTime: String!, status: String! }
      type MaintenanceTicket { id: ID!, equipmentId: ID!, labId: ID!, description: String!, reportedByUserId: ID!, assignedToUserId: ID, status: String!, priority: String!, createdAt: String!, updatedAt: String! }
      type Document { id: ID!, type: String!, title: String!, url: String!, version: Int!, uploadedByUserId: ID!, uploadedAt: String! }
      type Experiment { id: ID!, labId: ID!, createdByUserId: ID!, title: String!, description: String, createdAt: String!, documents: [Document!]! }
      type Notification { id: ID!, userId: ID!, type: String!, message: String!, relatedId: ID, metadata: String, createdAt: String!, read: Boolean! }
      input UploadDocumentInput { type: String!, title: String!, url: String }
      input UpdateMeInput { name: String, department: String }
      input RegisterInput { email: String!, name: String!, roleName: String!, department: String }
      type Booking { id: ID!, labId: ID!, userId: ID!, startTime: String!, endTime: String!, purpose: String, status: String!, approvedBy: ID, approvedAt: String, createdAt: String! }
      input CreateBookingInput { labId: ID!, startTime: String!, endTime: String!, purpose: String }
    type Query {
      me: User
      labs: [Lab!]!
      equipment(labId: ID): [Equipment!]!
        labSchedules(labId: ID!, from: String, to: String): [LabSchedule!]!
        myBookings: [Booking!]!
        pendingBookings: [Booking!]!
        maintenanceTickets: [MaintenanceTicket!]!
        maintenanceTicket(id: ID!): MaintenanceTicket
        experiments: [Experiment!]!
        myNotifications: [Notification!]!
    }
      type Mutation {
        uploadDocument(experimentId: ID!, input: UploadDocumentInput!): Document!
        updateMe(input: UpdateMeInput!): User!
        login(email: String!): User!
        register(input: RegisterInput!): User!
        createBooking(input: CreateBookingInput!): Booking!
        approveBooking(id: ID!): Booking!
        rejectBooking(id: ID!): Booking!
        cancelBooking(id: ID!): Boolean!
        markNotificationRead(id: ID!): Boolean!
      }
  `,
  resolvers: {
    Query: {
      me: async (_: any, __: any, ctx: any) => ctx.user || null,
      labs: async (_: any, __: any, ctx: any) => {
        const u = ctx.user;
        if (!u || !can(u.roleName as any, 'lab:view')) throw new GraphQLError('Forbidden');
        return db.select().from(schema.labs);
      },
      equipment: async (_: any, args: any, ctx: any) => {
        const u = ctx.user;
        if (!u || !can(u.roleName as any, 'equipment:view')) throw new GraphQLError('Forbidden');
        if (args.labId) return db.select().from(schema.equipment).where(eq(schema.equipment.labId, args.labId));
        return db.select().from(schema.equipment);
      },
        labSchedules: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'lab:view')) throw new GraphQLError('Forbidden');
          let q = db.select().from(schema.labSchedules).where(eq(schema.labSchedules.labId, args.labId));
          // Filter by from/to if provided
          const from = args.from ? new Date(args.from) : null;
          const to = args.to ? new Date(args.to) : null;
          let rows = await q;
          if (from) rows = rows.filter((r: any) => new Date(r.endTime).getTime() >= from.getTime());
          if (to) rows = rows.filter((r: any) => new Date(r.startTime).getTime() <= to.getTime());
          return rows;
        },
        myBookings: async (_: any, __: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'booking:view')) throw new GraphQLError('Forbidden');
          const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.userId, u.id));
          return rows;
        },
        maintenanceTickets: async (_: any, __: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'maintenance:view')) throw new GraphQLError('Forbidden');
          return db.select().from(schema.maintenanceTickets);
        },
        maintenanceTicket: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'maintenance:view')) throw new GraphQLError('Forbidden');
          const rows = await db.select().from(schema.maintenanceTickets).where(eq(schema.maintenanceTickets.id, args.id)).limit(1);
          return rows[0] || null;
        },
        experiments: async (_: any, __: any, ctx: any) => {
          const u = ctx.user;
          if (!u) throw new GraphQLError('Unauthorized');
          const exps = await db.select().from(schema.experiments);
          const docs = await db.select().from(schema.documents);
          const byExp = new Map<string, any[]>();
          for (const d of docs) {
            const arr = byExp.get(d.experimentId) || [];
            arr.push(d);
            byExp.set(d.experimentId, arr);
          }
          return exps.map((e) => ({ ...e, documents: byExp.get(e.id) || [] }));
        },
        myNotifications: async (_: any, __: any, ctx: any) => {
          const u = ctx.user;
          if (!u) throw new GraphQLError('Unauthorized');
          const rows = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, u.id));
          return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        pendingBookings: async (_: any, __: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'booking:approve')) throw new GraphQLError('Forbidden');
          const rows = await db.select().from(schema.bookings);
          return rows.filter((b: any) => b.status === 'PENDING');
        },
    },
      Mutation: {
        uploadDocument: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'experiment:upload')) throw new GraphQLError('Forbidden');
          const { experimentId, input } = args;
          const exp = await db.select().from(schema.experiments).where(eq(schema.experiments.id, experimentId)).limit(1);
          if (!exp[0]) throw new GraphQLError('Not found');
          const existing = await db.select().from(schema.documents).where(eq(schema.documents.experimentId, experimentId));
          const sameTitle = existing.filter((d) => d.title === input.title);
          const nextVersion = sameTitle.length ? Math.max(...sameTitle.map((d) => d.version)) + 1 : 1;
          const created = await db
            .insert(schema.documents)
            .values({
              experimentId,
              type: input.type,
              title: input.title,
              url: input.url || `/docs/${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
              version: nextVersion,
              uploadedByUserId: u.id,
            })
            .returning();
          return created[0];
        },
        updateMe: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u) throw new GraphQLError('Unauthorized');
          const input = args.input || {};
          const values: any = {};
          if (typeof input.name === 'string') values.name = input.name;
          if (typeof input.department === 'string') values.department = input.department;
          if (!Object.keys(values).length) return u;
          const updated = await db.update(schema.users).set(values).where(eq(schema.users.id, u.id)).returning();
          return updated[0] || u;
        },
        login: async (_: any, args: any) => {
          const email = String(args.email || '').toLowerCase();
          const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
          if (!rows[0]) throw new GraphQLError('USER_NOT_FOUND');
          return rows[0];
        },
        register: async (_: any, args: any) => {
          const { email, name, roleName, department } = args.input || {};
          const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
          if (rows[0]) return rows[0];
          const inserted = await db
            .insert(schema.users)
            .values({ email, name, roleName, department })
            .returning();
          return inserted[0];
        },
        createBooking: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'booking:create')) throw new GraphQLError('Forbidden');
          const { labId, startTime, endTime, purpose } = args.input || {};
          const start = new Date(startTime);
          const end = new Date(endTime);
          if (!(labId && startTime && endTime) || end <= start) throw new GraphQLError('Invalid time range');
          // Overlap check: existing confirmed bookings
          const bookings = await db.select().from(schema.bookings).where(eq(schema.bookings.labId, labId));
          const overlaps = bookings.find((b: any) => (b.status === 'CONFIRMED' || b.status === 'PENDING') && !(new Date(b.endTime) <= start || new Date(b.startTime) >= end));
          if (overlaps) throw new GraphQLError('Slot already booked or pending approval');
          const created = await db
            .insert(schema.bookings)
            .values({ labId, userId: u.id, startTime: start as any, endTime: end as any, purpose, status: 'PENDING' })
            .returning();
          
          // Create notifications for admins, faculty, and technicians
          const approvers = await db.select().from(schema.users);
          const lab = await db.select().from(schema.labs).where(eq(schema.labs.id, labId)).limit(1);
          const labName = lab[0]?.name || 'Lab';
          for (const approver of approvers) {
            if (['ADMIN', 'FACULTY', 'TECHNICIAN'].includes(approver.roleName)) {
              await db.insert(schema.notifications).values({
                userId: approver.id,
                type: 'BOOKING_REQUEST',
                message: `${u.name} requested to book ${labName} on ${start.toLocaleString()}`,
                relatedId: created[0].id,
                metadata: JSON.stringify({ bookingId: created[0].id, labId, userId: u.id }),
              });
            }
          }
          return created[0];
        },
        approveBooking: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'booking:approve')) throw new GraphQLError('Forbidden');
          const id = args.id as string;
          const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
          const booking = rows[0];
          if (!booking) throw new GraphQLError('Not found');
          if (booking.status !== 'PENDING') throw new GraphQLError('Booking is not pending');
          
          // Check for conflicts with other approved bookings
          const bookings = await db.select().from(schema.bookings).where(eq(schema.bookings.labId, booking.labId));
          const overlaps = bookings.find((b: any) => b.id !== id && b.status === 'CONFIRMED' && !(new Date(b.endTime) <= new Date(booking.startTime) || new Date(b.startTime) >= new Date(booking.endTime)));
          if (overlaps) throw new GraphQLError('Conflict with existing booking');
          
          const updated = await db.update(schema.bookings).set({ 
            status: 'CONFIRMED' as any, 
            approvedBy: u.id,
            approvedAt: new Date() as any
          }).where(eq(schema.bookings.id, id)).returning();
          
          // Mark overlapping schedules as BOOKED
          const slots = await db.select().from(schema.labSchedules).where(eq(schema.labSchedules.labId, booking.labId));
          const toBook = slots.filter((s: any) => !(new Date(s.endTime) <= new Date(booking.startTime) || new Date(s.startTime) >= new Date(booking.endTime)));
          for (const s of toBook) {
            await db.update(schema.labSchedules).set({ status: 'BOOKED' as any }).where(eq(schema.labSchedules.id, s.id));
          }
          
          // Notify the requester
          await db.insert(schema.notifications).values({
            userId: booking.userId,
            type: 'BOOKING_APPROVED',
            message: `Your booking request has been approved by ${u.name}`,
            relatedId: id,
            metadata: JSON.stringify({ bookingId: id, approvedBy: u.id }),
          });
          
          return updated[0];
        },
        rejectBooking: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u || !can(u.roleName as any, 'booking:approve')) throw new GraphQLError('Forbidden');
          const id = args.id as string;
          const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
          const booking = rows[0];
          if (!booking) throw new GraphQLError('Not found');
          if (booking.status !== 'PENDING') throw new GraphQLError('Booking is not pending');
          
          const updated = await db.update(schema.bookings).set({ status: 'REJECTED' as any }).where(eq(schema.bookings.id, id)).returning();
          
          // Notify the requester
          await db.insert(schema.notifications).values({
            userId: booking.userId,
            type: 'BOOKING_REJECTED',
            message: `Your booking request has been rejected by ${u.name}`,
            relatedId: id,
            metadata: JSON.stringify({ bookingId: id, rejectedBy: u.id }),
          });
          
          return updated[0];
        },
        cancelBooking: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          const id = args.id as string;
          const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
          const b = rows[0];
          if (!b) throw new GraphQLError('Not found');
          if (!u || (u.id !== b.userId && !can(u.roleName as any, 'booking:manage'))) throw new GraphQLError('Forbidden');
          await db.update(schema.bookings).set({ status: 'CANCELLED' as any }).where(eq(schema.bookings.id, id));
          // Recompute slots for this window; set AVAILABLE if no other active booking overlaps
          const slots = await db.select().from(schema.labSchedules).where(eq(schema.labSchedules.labId, b.labId));
          const affected = slots.filter((s: any) => !(new Date(s.endTime) <= new Date(b.startTime) || new Date(s.startTime) >= new Date(b.endTime)));
          const other = await db.select().from(schema.bookings).where(eq(schema.bookings.labId, b.labId));
          for (const s of affected) {
            const stillOverlap = other.find((o: any) => o.status === 'CONFIRMED' && !(new Date(o.endTime) <= new Date(s.startTime) || new Date(o.startTime) >= new Date(s.endTime)));
            if (!stillOverlap) {
              await db.update(schema.labSchedules).set({ status: 'AVAILABLE' as any }).where(eq(schema.labSchedules.id, s.id));
            }
          }
          return true;
        },
        markNotificationRead: async (_: any, args: any, ctx: any) => {
          const u = ctx.user;
          if (!u) throw new GraphQLError('Unauthorized');
          const id = args.id as string;
          await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.id, id));
          return true;
        },
      },
  },
});

const yoga = createYoga({
  schema: gqlSchema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }: YogaInitialContext) => {
    const token =
      request.headers.get('x-user') || request.headers.get('authorization')?.replace('Bearer ', '') || '';
    if (!token) return { user: null } as any;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      token
    );
    const looksLikeEmail = token.includes('@');
    let current: any = null;
    try {
      if (isUuid) {
        const byId = await db.select().from(schema.users).where(eq(schema.users.id, token as any)).limit(1);
        current = byId[0] || null;
      }
      if (!current && looksLikeEmail) {
        const byEmail = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, token))
          .limit(1);
        current = byEmail[0] || null;
      }
    } catch {
      // fall through and treat as no user
    }
    return { user: current || null } as any;
  },
});

app.all('/graphql', async (c) => {
  const res = await yoga.fetch(c.req.raw);
  return res;
});

export default app;

// Start server when running under Node.js
const port = Number(process.env.PORT || 8787);
serve({ fetch: app.fetch, port });
console.log(`[cc-services] listening on http://localhost:${port}`);
