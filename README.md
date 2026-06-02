# Customer Support RAG

AI-powered customer support platform with custom RAG agents for businesses.


## Table of Contents

* [Tech Stack](#tech-stack)

  * [Frontend](#frontend)
  * [Backend](#backend)
  * [Database](#database)
  * [Infrastructure](#infrastructure)

* [Project Structure](#project-structure)

* [Prerequisites](#prerequisites)

* [Backend Environment Variables](#backend-environment-variables)

* [Recommended Development Workflow](#recommended-development-workflow)

  * [Start PostgreSQL Only](#start-postgresql-only)

* [Backend Setup](#backend-setup)

* [Prisma Commands](#prisma-commands)

  * [Generate Prisma Client](#generate-prisma-client)
  * [Create Initial Migration](#create-initial-migration)
  * [Create Future Migrations](#create-future-migrations)
  * [Apply Existing Production Migrations](#apply-existing-production-migrations)

* [Reset Database](#reset-database)

* [Run Backend](#run-backend)

* [Frontend Setup](#frontend-setup)

* [Full Development Workflow](#full-development-workflow)

  * [Terminal 1 — Postgres](#terminal-1--postgres)
  * [Terminal 2 — Backend](#terminal-2--backend)
  * [Terminal 3 — Frontend](#terminal-3--frontend)

* [Viewing Database Tables](#viewing-database-tables)

  * [Option 1 — pgAdmin](#option-1--pgadmin)

* [Docker Production Workflow](#docker-production-workflow)

  * [Start Entire Application](#start-entire-application)
  * [Run Entire Application In Background](#run-entire-application-in-background)
  * [Stop Entire Application](#stop-entire-application)
  * [Remove Volumes Too](#remove-volumes-too)

* [Backend Docker Notes](#backend-docker-notes)

* [Useful Docker Commands](#useful-docker-commands)

  * [View Running Containers](#view-running-containers)
  * [Stop All Containers](#stop-all-containers)
  * [Remove Docker Build Cache](#remove-docker-build-cache)
  * [Remove Unused Docker Resources](#remove-unused-docker-resources)

* [Recommended Development Architecture](#recommended-development-architecture)

  * [Development](#development)
  * [Production](#production)


## Tech Stack

### Frontend
- Next.js
- TailwindCSS

### Backend
- NestJS
- Prisma ORM

### Database
- PostgreSQL
- Redis (BullMQ)

### Infrastructure
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
│   └── rag/
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

## Backend Environment Variables

Create:

```txt
apps/backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/customer_support_rag"

PORT=8000

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



## Start PostgreSQL Only

From project root:

```bash
docker compose up -d postgres
```

Verify:

```bash
docker ps
```



## Backend Setup

Go to backend:

```bash
cd apps/backend
```

Install dependencies:

```bash
npm install
```

---

## Prisma Commands

### Generate Prisma Client

```bash
npx prisma generate
```



### Create Initial Migration

```bash
npx prisma migrate dev --name init
```

This will:
- create migration SQL
- create DB tables
- update database
- generate Prisma client



### Create Future Migrations

Example:

```bash
npx prisma migrate dev --name add-business-model
```



### Apply Existing Production Migrations

```bash
npx prisma migrate deploy
```



## Reset Database

WARNING:
Deletes all data.

```bash
npx prisma migrate reset
```

---

## Run Backend

```bash
npm run start:dev
```

Backend runs on:

```txt
http://localhost:8000
```
## Swagger API Doc
After running backend service you can access API Documentation on http://localhost:8000/api/docs
---

## Frontend Setup

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

## Terminal 2 — Redis

```bash
docker compose up -d redis
```
---

## Terminal 3 — Backend

```bash
cd apps/backend

npx prisma generate

npx prisma migrate dev --name init

npm run start:dev
```

---

## Terminal 4 — Frontend

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
  redis

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
  redis
```

---

