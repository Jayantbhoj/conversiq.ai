# Customer Support RAG

AI-powered customer support platform with custom RAG agents for businesses.

---

# Tech Stack

## Frontend
- Next.js
- TailwindCSS

## Backend
- NestJS
- Prisma ORM

## Database
- PostgreSQL

## Infrastructure
- Docker
- Docker Compose

---

# Project Structure

```txt
customer-support-rag/
│
├── apps/
│   ├── frontend/
│   └── backend/
│
├── docker-compose.yml
│
└── README.md
```

---

# Prerequisites

Install:

- Node.js 20+
- Docker Desktop
- npm

Recommended:
- pgAdmin
- TablePlus

---

# Backend Environment Variables

Create:

```txt
apps/backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/customer_support_rag"

PORT=4000

NODE_ENV=development
```

---

# Recommended Development Workflow

During development:

Run:
- postgres in Docker
- frontend locally
- backend locally

Benefits:
- hot reload
- faster debugging
- easier Prisma workflow
- easier database inspection

---

# Start PostgreSQL Only

From project root:

```bash
docker compose up -d postgres
```

Verify:

```bash
docker ps
```

---

# Backend Setup

Go to backend:

```bash
cd apps/backend
```

Install dependencies:

```bash
npm install
```

---

# Prisma Commands

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Create Initial Migration

```bash
npx prisma migrate dev --name init
```

This will:
- create migration SQL
- create DB tables
- update database
- generate Prisma client

---

## Create Future Migrations

Example:

```bash
npx prisma migrate dev --name add-business-model
```

---

## Apply Existing Production Migrations

```bash
npx prisma migrate deploy
```

---

## Reset Database

WARNING:
Deletes all data.

```bash
npx prisma migrate reset
```

---

# Run Backend

```bash
npm run start:dev
```

Backend runs on:

```txt
http://localhost:4000
```

---

# Frontend Setup

Go to frontend:

```bash
cd apps/frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# Full Development Workflow

## Terminal 1 — Postgres

```bash
docker compose up -d postgres
```

---

## Terminal 2 — Backend

```bash
cd apps/backend

npx prisma generate

npx prisma migrate dev --name init

npm run start:dev
```

---

## Terminal 3 — Frontend

```bash
cd apps/frontend

npm install

npm run dev
```

---

# Viewing Database Tables

## Option 1 — pgAdmin

Connection details:

```txt
Host: localhost
Port: 5434
Username: postgres
Password: postgres
Database: customer_support_rag
```

---

# Docker Production Workflow

Production uses:
- frontend container
- backend container
- postgres container

---

# Start Entire Application

From project root:

```bash
docker compose up --build
```

---

# Run Entire Application In Background

```bash
docker compose up -d --build
```

---

# Stop Entire Application

```bash
docker compose down
```

---

# Remove Volumes Too

WARNING:
Deletes postgres data.

```bash
docker compose down -v
```

---

# Backend Docker Notes

Backend Dockerfile:
- installs dependencies
- generates Prisma client
- builds NestJS app

Production startup should also run:

```bash
npx prisma migrate deploy
```

before starting backend server.

---

# Useful Docker Commands

## View Running Containers

```bash
docker ps
```

---

## Stop All Containers

```bash
docker stop $(docker ps -aq)
```

---

## Remove Docker Build Cache

```bash
docker builder prune -a -f
```

---

## Remove Unused Docker Resources

```bash
docker system prune -a -f
```

---

# Recommended Development Architecture

## Development

```txt
Docker:
  postgres

Local:
  backend
  frontend
```

---

## Production

```txt
Docker:
  frontend
  backend
  postgres
```

---

