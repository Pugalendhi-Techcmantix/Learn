# Learn

Daily hands-on labs from my Full-Stack & DevOps upskilling roadmap (Nov – Dec 2026).

## Run

**Frontend** (React 19 · TypeScript · Vite · Ant Design · Tailwind CSS)

```bash
npm install
npm run dev          # http://localhost:5173
```

**Backend** (Node.js · Express · Prisma 7 · MySQL/MariaDB via XAMPP)

Start MySQL in the XAMPP Control Panel first, then:

```bash
cd backend
cp .env.example .env # then fill in the JWT secrets
npm install
npm run db:generate  # build the Prisma Client
npm run db:migrate   # create the database and tables
npm run db:seed      # test users + products
npm run dev          # http://localhost:4000
```

Test logins (local only): `user@example.com` / `admin@example.com`, password `Password@123`.

## Daily log

| Day | Date | Topic | What I did |
|---|---|---|---|
| 1 | Nov 18, 2026 | Browser & React Profiling | Chrome DevTools source maps and breakpoints (conditional, logpoint, DOM, event, XHR); React DevTools Profiler to find unnecessary re-renders in a product table; added pagination as the first fix. |
| 2 | Nov 19, 2026 | Network, CORS & Auth Debugging | Built an Express + Prisma 7 + MySQL auth API (JWT access token + httpOnly refresh cookie, 401/403 middleware). Debugged two CORS failures in the Network tab (wrong allowed origin, missing `credentials: true`), watched a token expire and refresh automatically through an Axios interceptor, and tested 403, 500, timeout and `fetch` vs Axios error handling. |
