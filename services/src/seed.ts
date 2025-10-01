import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from './db/client.js'
import * as schema from './db/schema.js'

async function up() {
  // Seed users
  const users = [
    { email: 'admin@vit.ac.in', name: 'Admin One', roleName: 'ADMIN' as const, department: 'Administration' },
    { email: 'faculty@vit.ac.in', name: 'Dr. Faculty', roleName: 'FACULTY' as const, department: 'SMEC' },
    { email: 'student@vit.ac.in', name: 'Student User', roleName: 'STUDENT' as const, department: 'SMEC' },
    { email: 'tech@vit.ac.in', name: 'Tech Support', roleName: 'TECHNICIAN' as const, department: 'Maintenance' },
  ]
  for (const u of users) {
    const exists = await db.select().from(schema.users).where(eq(schema.users.email, u.email)).limit(1)
    if (!exists[0]) await db.insert(schema.users).values(u)
  }

  // Seed labs
  const labA = await oneLab('Automation Lab', 'SMEC Block, Floor 2', 24)
  const labB = await oneLab('Robotics Lab', 'Tech Park, Floor 1', 18)

  // Seed equipment
  await upsertEquipment(labA, [
    { name: 'Oscilloscope A', type: 'Oscilloscope' },
    { name: 'Signal Generator', type: 'Generator' },
  ])
  await upsertEquipment(labB, [
    { name: 'Robot Arm', type: 'Manipulator' },
    { name: 'Lidar Scanner', type: 'Sensor' },
  ])

  // Seed experiments
  const ex1 = await oneExperiment(labA, 'faculty@vit.ac.in', 'Control Systems Experiment')
  const ex2 = await oneExperiment(labB, 'faculty@vit.ac.in', 'Robot Kinematics Study')

  // Seed docs
  // Seed lab schedules for next 3 days: 9:00-17:00 hourly
  await seedLabSchedules(labA);
  await seedLabSchedules(labB);
  await maybeDoc(ex1, 'REPORT', 'Initial Report')
  await maybeDoc(ex2, 'SOP', 'Safety Procedures')

  console.log('Seed complete.')
}

async function oneLab(name: string, location: string, capacity: number) {
  const found = await db.select().from(schema.labs).where(eq(schema.labs.name, name)).limit(1)
  if (found[0]) return found[0].id
  const ins = await db.insert(schema.labs).values({ name, location, capacity }).returning()
  return ins[0].id
}

async function upsertEquipment(labId: string, items: Array<{ name: string; type: string }>) {
  for (const it of items) {
    const exists = await db
      .select()
      .from(schema.equipment)
      .where(eq(schema.equipment.name, it.name))
      .limit(1)
    if (!exists[0]) await db.insert(schema.equipment).values({ labId, name: it.name, type: it.type })
  }
}

async function oneExperiment(labId: string, email: string, title: string) {
  const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  const found = await db.select().from(schema.experiments).where(eq(schema.experiments.title, title)).limit(1)
  if (found[0]) return found[0].id
  const ins = await db
    .insert(schema.experiments)
    .values({ labId, createdByUserId: user[0].id, title })
    .returning()
  return ins[0].id
}

async function maybeDoc(experimentId: string, type: 'REPORT' | 'RESULT' | 'SOP', title: string) {
  const existing = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.experimentId, experimentId))
  const sameTitle = existing.filter((d) => d.title === title)
  const nextVersion = sameTitle.length ? Math.max(...sameTitle.map((d) => d.version)) + 1 : 1
  await db
    .insert(schema.documents)
    .values({ experimentId, type, title, url: `/docs/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`, version: nextVersion, uploadedByUserId: existing[0]?.uploadedByUserId || (await anyUserId()) })
}

async function anyUserId() {
  const u = await db.select().from(schema.users).limit(1)
  return u[0].id
}

async function seedLabSchedules(labId: string) {
  const existing = await db.select().from(schema.labSchedules).where(eq(schema.labSchedules.labId, labId))
  if (existing.length > 0) return
  const now = new Date()
  for (let d = 0; d < 3; d++) {
    const day = new Date(now)
    day.setDate(now.getDate() + d)
    day.setHours(9, 0, 0, 0)
    for (let h = 0; h < 8; h++) {
      const start = new Date(day.getTime() + h * 60 * 60 * 1000)
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      await db.insert(schema.labSchedules).values({ labId, startTime: start as any, endTime: end as any }).returning()
    }
  }
}

up().catch((e) => {
  console.error(e)
  process.exit(1)
}).then(() => process.exit(0))