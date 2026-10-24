# Sales CRM and Lead Pipeline Platform

Full-stack CRM demo with React/TypeScript, Node/Express, PostgreSQL, Redis and BullMQ.

## Features
- Contacts, companies, leads and opportunities
- Pipeline stages and ownership
- Trigger-condition-action workflow automation
- BullMQ scheduled jobs and Redis-backed event processing
- REST API with validation and error handling
- Jest unit/integration tests and Playwright end-to-end tests
- Docker Compose for PostgreSQL, Redis, API and web client

## Run
1. Copy `.env.example` to `.env`.
2. `docker compose up --build`
3. API: http://localhost:4000
4. Client: http://localhost:5173

For local development, use Node.js 20+ and PostgreSQL/Redis.
