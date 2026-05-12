# Backend — Order & Inventory Management

This is the REST API for the Order & Inventory Management System. It handles authentication, product management, order processing, and dashboard stats.

---

## Tech Stack

- **Node.js** with ES Modules
- **Express.js** v5
- **PostgreSQL** — relational database
- **Prisma ORM** v7 — database access and migrations
- **JWT** — access + refresh token authentication
- **bcryptjs** — password hashing
- **Zod** — request validation
- **dotenv, helmet, cors, morgan** — utilities and security

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) running locally (or a remote connection string)
- npm v8+

---

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment variables

Create a `.env` file in the `backend/` folder with the following:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/order_inventory_db"

PORT=5000

JWT_ACCESS_SECRET=replace_this_with_a_long_random_string
JWT_REFRESH_SECRET=replace_this_with_another_long_random_string
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Create the database

Open your PostgreSQL client (psql, pgAdmin, or TablePlus) and run:

```sql
CREATE DATABASE order_inventory_db;
```

### 4. Run database migrations

This creates all the tables based on the Prisma schema:

```bash
npm run db:migrate
```

When prompted, give the migration a name like `init`.

### 5. Generate the Prisma client

```bash
npm run db:generate
```

### 6. Seed the database

This creates two default users and 5 sample products:

```bash
npm run db:seed
```

After seeding, you can log in with:

| Role  | Email             | Password       |
| ----- | ----------------- | -------------- |
| Admin | admin@example.com | password123    |
| Staff | staff@example.com | password123456 |

### 7. Start the development server

```bash
npm run dev
```

The server starts at **http://localhost:5000**

You can verify it's running by visiting http://localhost:5000/health — it should return `{ "status": "ok" }`.

---

## Available Scripts

| Script                | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the server with hot reload (nodemon)        |
| `npm start`           | Start the server without hot reload               |
| `npm run db:migrate`  | Create and apply a new migration (development)    |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run db:seed`     | Seed the database with default users and products |
| `npm run db:studio`   | Open Prisma Studio — a visual database browser    |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema (tables, relations, enums)
│   ├── migrations/          # Auto-generated migration files
│   └── seed.js              # Database seeder
│
├── src/
│   ├── config/
│   │   ├── env.js           # Loads and validates environment variables
│   │   └── prisma.js        # Prisma client instance
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT token verification
│   │   ├── role.middleware.js     # Role-based access control
│   │   ├── validate.middleware.js # Zod request validation
│   │   └── error.middleware.js    # Centralized error handler
│   │
│   ├── modules/
│   │   ├── auth/            # Login, refresh token, get current user
│   │   ├── products/        # Product CRUD
│   │   ├── orders/          # Order creation and management
│   │   └── dashboard/       # Summary stats
│   │
│   ├── routes/
│   │   └── index.js         # Mounts all module routes
│   │
│   ├── utils/
│   │   ├── jwt.js           # Token generation and verification
│   │   ├── response.js      # Consistent API response helpers
│   │   ├── pagination.js    # Pagination utilities
│   │   └── generateOrderNumber.js
│   │
│   ├── app.js               # Express app setup (middleware, routes)
│   └── server.js            # Entry point — connects DB and starts server
│
├── .env                     # Your local environment variables
├── package.json
└── README.md
```

---

## API Reference

All API routes are prefixed with `/api/v1`.

Protected routes require the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

---

### Authentication

| Method | Endpoint      | Auth Required | Description                      |
| ------ | ------------- | ------------- | -------------------------------- |
| POST   | /auth/login   | No            | Login and receive tokens         |
| POST   | /auth/refresh | No            | Get a new access token           |
| GET    | /auth/me      | Yes           | Get the currently logged-in user |

**POST /auth/login**

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

### Products

| Method | Endpoint      | Auth | Role  | Description                        |
| ------ | ------------- | ---- | ----- | ---------------------------------- |
| GET    | /products     | Yes  | Any   | List products (paginated + search) |
| GET    | /products/:id | Yes  | Any   | Get a single product               |
| POST   | /products     | Yes  | Admin | Create a new product               |
| PATCH  | /products/:id | Yes  | Admin | Update a product                   |
| DELETE | /products/:id | Yes  | Admin | Delete a product                   |

**GET /products** — supports query params: `page`, `limit`, `search` (name), `sku`

**POST /products** request body:

```json
{
  "name": "Wireless Mouse",
  "sku": "MOU-001",
  "price": 29.99,
  "stockQuantity": 100
}
```

---

### Orders

| Method | Endpoint           | Auth | Role  | Description                      |
| ------ | ------------------ | ---- | ----- | -------------------------------- |
| GET    | /orders            | Yes  | Any   | List orders (paginated + filter) |
| GET    | /orders/:id        | Yes  | Any   | Get order with full details      |
| POST   | /orders            | Yes  | Any   | Create a new order               |
| PATCH  | /orders/:id/status | Yes  | Admin | Update order status              |

**GET /orders** — supports query params: `page`, `limit`, `status` (pending / completed / cancelled)

**POST /orders** request body:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

Creating an order automatically deducts stock from each product using a database transaction. If any product is out of stock, the entire order is rejected.

**PATCH /orders/:id/status** request body:

```json
{ "status": "completed" }
```

---

### Dashboard

| Method | Endpoint         | Auth | Description                                      |
| ------ | ---------------- | ---- | ------------------------------------------------ |
| GET    | /dashboard/stats | Yes  | Total products, orders, low stock, recent orders |

---

## Response Format

Every response follows the same structure:

**Success:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Roles & Permissions

| Action                          | Admin | Staff |
| ------------------------------- | ----- | ----- |
| View dashboard                  | ✅    | ✅    |
| View products and orders        | ✅    | ✅    |
| Create orders                   | ✅    | ✅    |
| Create / edit / delete products | ✅    | ❌    |
| Complete or cancel orders       | ✅    | ❌    |

---

## Database Schema

The database has four tables:

- **users** — stores user accounts with hashed passwords and roles
- **products** — stores product catalog with SKU, price, and stock quantity
- **orders** — stores order records linked to the user who created them
- **order_items** — stores individual line items within each order (product, quantity, price at time of order)

Relationships:

- A user can have many orders
- An order belongs to one user and has many order items
- An order item belongs to one order and one product
