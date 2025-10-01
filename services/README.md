Backend (Hono + Drizzle + Postgres)
===================================

Prerequisites
- Node.js 18+
- A Postgres database (local Docker or managed)

Setup
1. Install deps
	```powershell
	npm install
	```
2. Create .env from example and set DATABASE_URL
	```powershell
	Copy-Item .env.example .env
	```
3. Generate and run migrations (optional until we add migration files)
	```powershell
	npm run db:generate
	npm run db:migrate
	```

Develop
```powershell
npm run dev
```

API
- GET /             -> health
- GET /api/me       -> user from token
- GET /api/labs     -> list labs (requires lab:view)
- GET /api/equipment?labId=... -> list equipment (requires equipment:view)
- GET /api/maintenance -> list tickets (requires maintenance:view)

Auth
- Send `x-user` header as a user id (uuid) or email (demo-only); replace with real auth later.
