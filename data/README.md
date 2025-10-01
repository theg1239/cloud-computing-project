# Mock Data Layer

This folder contains typed, in-memory data to bootstrap development until a backend is ready.

## Files
- `users.ts` — Sample users across roles (Admin, Faculty, Student, Technician)
- `labs.ts` — Labs with status and equipment references
- `equipment.ts` — Equipment assets with status and lab association
- `bookings.ts` — Example bookings with realistic times and conflict scenarios
- `maintenance.ts` — Maintenance tickets including history and priorities
- `experiments.ts` — Experiment records with document references
- `notifications.ts` — Simple notifications mapped to users

## Types
Domain models live in `types/models.ts`.

## Mock API
Use `lib/mockApi.ts` for async access with simulated latency and simple business logic:
- `getOverviewCounts()` — Quick dashboard counts
- `list*()` — Read lists
- `createBooking()` — Creates booking with time-overlap prevention per lab
- `reportMaintenance()` — Opens a maintenance ticket

## Migrating to a real backend
When you add a backend:
1. Replace functions in `lib/mockApi.ts` with real HTTP/GraphQL calls.
2. Keep TypeScript models for end-to-end type safety.
3. Remove or gate the mock by environment, e.g., `process.env.EXPO_PUBLIC_USE_MOCK`.
