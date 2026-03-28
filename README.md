# Flipkart Clone Assignment

This repository contains a full-stack Flipkart-inspired e-commerce assignment built for interview evaluation. It covers product listing, product details, cart management, checkout, and order confirmation, while keeping the code modular enough to explain comfortably during an interview.

## Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + PostgreSQL
- Data: Seeded sample catalog inserted into PostgreSQL on first run
- Database design: PostgreSQL schema included in `server/db/schema.sql`

## Features

- Flipkart-style blue header with search
- Product listing grid with category filters
- Product detail page with image gallery, highlights, and specifications
- Cart page with quantity updates and price summary
- Checkout page with address form and order summary
- Order confirmation page with generated order ID
- Responsive layout for desktop, tablet, and mobile

## Project Structure

```text
client/  -> React frontend
server/  -> Express backend with PostgreSQL integration
server/db/schema.sql -> PostgreSQL schema
```

## Local Setup

### 1. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 2. Configure PostgreSQL

Create a `server/.env` file using `server/.env.example`.

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/flipkart_clone
PORT=5000
```

For Railway PostgreSQL, use the connection URL provided in the Railway dashboard.

### 3. Start the backend

```bash
cd server
npm run dev
```

On first run, the backend creates the schema and seeds products into PostgreSQL automatically.

### 4. Start the frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

## Assumptions

- Authentication is intentionally skipped because the assignment explicitly says to assume a default logged-in user.
- The current demo stores cart state in browser local storage for speed and clarity.
- The backend now uses PostgreSQL for products and orders, while cart and wishlist stay in local storage for a simpler frontend flow.

## Interview Notes

- Search and category filtering live in a shared React context so the product list updates instantly.
- Cart state is derived from the product catalog, which keeps pricing logic centralized.
- The SQL schema separates products, images, specifications, cart items, orders, and order items to keep relationships clear.
