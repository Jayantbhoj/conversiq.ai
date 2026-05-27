# Backend API

This backend provides a NestJS API with PostgreSQL data handling via Prisma.

## Available endpoints

- `GET /` - application status
- `GET /health` - health check
- `GET /agents` - list agents
- `GET /agents/:id` - fetch one agent
- `POST /agents` - create a new agent
- `PUT /agents/:id` - update an existing agent
- `DELETE /agents/:id` - remove an agent
- `GET /agents/:id/knowledge` - list knowledge chunks for an agent
- `POST /agents/:id/knowledge` - create a knowledge chunk for an agent
- `DELETE /agents/:id/knowledge/:knowledgeId` - remove a knowledge chunk
- `GET /agents/:id/chats` - list chat sessions for an agent
- `POST /agents/:id/chats` - create a new chat session
- `GET /chats/:id/messages` - list messages for a chat session
- `POST /chats/:id/messages` - add a chat message
- `POST /chats/:id/rating` - submit a chat rating

## Database

This backend uses Prisma with PostgreSQL. Copy `.env.example` to `.env` and set `DATABASE_URL` before running migrations.

## Run locally

```bash
cd apps/backend
npm install
npm run prisma:generate
npm run start:dev
```
