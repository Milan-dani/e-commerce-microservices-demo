# Order Service

## Purpose
Handles order creation, lifecycle management, and event publishing.

## Tech Stack
- Node.js
- PostgreSQL

## Responsibilities
- Create orders (from cart)
- Order lifecycle (Pending → Paid → Shipped)
- Publishes `order.created` events
