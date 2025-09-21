# AlertHub Server (Node + Express + PostgreSQL)

This is a simple backend for AlertHub providing user registration and login.

## Requirements
- Node.js 18+
- PostgreSQL 13+

## Setup
1. Copy environment file:
   - PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Edit `.env` and set `DATABASE_URL`, `JWT_SECRET`, and other values.
3. Install dependencies:
   ```powershell
   cd server
   npm install
   ```
4. Create the database and run schema:
   - Ensure the database from `DATABASE_URL` exists.
   - Apply schema (psql):
   ```powershell
   # Replace with your connection; example assumes local trust auth
   psql "postgres://username:password@localhost:5432/alerthub" -f schema.sql
   ```

## Run the server
```powershell
npm run dev
```
Server will start on http://localhost:5000 by default.

## API
- POST `/api/register`
  - body: `{ full_name, role, password, username | email | phone | email_or_phone, extra_data }`
  - returns: `{ user }`
- POST `/api/login`
  - body: `{ role, password, username | email | phone | email_or_phone }`
  - returns: `{ user, token }`
- GET `/api/health`
  - returns: `{ ok: true, db: { ok: boolean } }`

## Notes
- Passwords are hashed with bcryptjs (10 rounds).
- JWT expires in 7 days; set a strong `JWT_SECRET` in production.
- Unique constraints on username/email/phone are enforced in the DB; duplicate attempts return 409.