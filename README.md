# Backend — Order & Inventory Management API

Node.js + Express REST API with PostgreSQL, Prisma ORM, and JWT authentication.

## Tech Stack

- Node.js + Express.js
- PostgreSQL
- Prisma ORM (v7)
- JWT (access + refresh tokens)
- bcryptjs
- Zod (validation)
- dotenv, helmet, cors, morgan

## Prerequisites

- Node.js v18+
- PostgreSQL running locally

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/order_inventory_db"
PORT=5000
JWT_ACCESS_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=change_this_to_another_long_random_string
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Create the database

```sql
CREATE DATABASE order_inventory_db;
```

### 4. Run migrations

```bash
npm run db:migrate
```

When prompted, enter a migration name like `init`.

### 5. Generate Prisma client

```bash
npm run db:generate
```

### 6. Seed the database

```bash
npm run db:seed
```

This creates two users and 5 sample products:

| Role  | Email                | Password       |
|-------|----------------------|----------------|
| Admin | admin@example.com    | password123    |
| Staff | staff@example.com    | password123456 |

### 7. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## Available Scripts

| Script           | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start with nodemon (hot reload) |
| `npm start`      | Start in production mode       |
| `npm run db:migrate` | Run Prisma migrations      |
| `npm run db:generate` | Regenerate Prisma client  |
| `npm run db:seed` | Seed the database             |
| `npm run db:studio` | Open Prisma Studio UI       |

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
└── src/
    ├── config/
    │   ├── env.js
    │   └── prisma.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── role.middleware.js
    │   ├── validate.middleware.js
    │   └── error.middleware.js
    ├── modules/
    │   ├── auth/
    │   ├── products/
    │   ├── orders/
    │   └── dashboard/
    ├── routes/
    │   └── index.js
    ├── utils/
    │   ├── jwt.js
    │   ├── response.js
    │   ├── pagination.js
    │   └── generateOrderNumber.js
    ├── app.js
    └── server.js
```

## API Reference

Base URL: `http://localhost:5000/api/v1`

All protected routes require: `Authorization: Bearer <accessToken>`

### Auth

| Method | Endpoint        | Auth | Description           |
|--------|-----------------|------|-----------------------|
| POST   | /auth/login     | No   | Login, returns tokens |
| POST   | /auth/refresh   | No   | Refresh access token  |
| GET    | /auth/me        | Yes  | Get current user      |

**Login request:**
```json
{ "email": "admin@example.com", "password": "password123" }
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" }
  }
}
```

### Products

| Method | Endpoint       | Auth | Role  | Description        |
|--------|----------------|------|-------|--------------------|
| POST   | /products      | Yes  | Admin | Create product     |
| GET    | /products      | Yes  | Any   | List with pagination |
| GET    | /products/:id  | Yes  | Any   | Get by ID          |
| PATCH  | /products/:id  | Yes  | Admin | Update product     |
| DELETE | /products/:id  | Yes  | Admin | Delete product     |

Query params for GET /products: `page`, `limit`, `search` (name), `sku`

**Create product:**
```json
{ "name": "Laptop Pro", "sku": "LAP-001", "price": 999.99, "stockQuantity": 50 }
```

### Orders

| Method | Endpoint            | Auth | Role  | Description         |
|--------|---------------------|------|-------|---------------------|
| POST   | /orders             | Yes  | Any   | Create order        |
| GET    | /orders             | Yes  | Any   | List with pagination |
| GET    | /orders/:id         | Yes  | Any   | Get with full details |
| PATCH  | /orders/:id/status  | Yes  | Admin | Update status       |

Query params for GET /orders: `page`, `limit`, `status` (pending/completed/cancelled)

**Create order:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Update status:**
```json
{ "status": "completed" }
```

### Dashboard

| Method | Endpoint          | Auth | Description     |
|--------|-------------------|------|-----------------|
| GET    | /dashboard/stats  | Yes  | Summary stats   |

**Response:**
```json
{
  "data": {
    "totalProducts": 10,
    "totalOrders": 25,
    "lowStockProducts": [...],
    "recentOrders": [...]
  }
}
```

## Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error:**
```json
{ "success": false, "message": "..." }
```

## Roles & Permissions

| Action                  | Admin | Staff |
|-------------------------|-------|-------|
| View products/orders    | ✅    | ✅    |
| Create orders           | ✅    | ✅    |
| Create/edit/delete products | ✅ | ❌  |
| Update order status     | ✅    | ❌    |
