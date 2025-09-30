# Payment Service

## Purpose
Simulates payment processing for orders and publishes payment events.

## Tech Stack
- Node.js

## Responsibilities
- Listens to `order.created` events
- Simulates payment (approve/decline)
- Publishes `payment.success` or `payment.failed` events
