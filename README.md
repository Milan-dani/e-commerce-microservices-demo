# 🛒 E-Commerce Microservices Demo

## Overview
A feature-rich e-commerce platform built with microservices architecture, Next.js frontend, Node.js backend, and Google Gemini AI. Demonstrates service isolation, event-driven communication, database-per-service, API Gateway, and Dockerized deployment.

## Architecture
- **Frontend:** Next.js (TypeScript), TailwindCSS, Recharts/Chart.js
- **API Gateway:** Express.js, JWT validation, service routing
- **Microservices:** Node.js (Express), MongoDB/PostgreSQL
- **Message Broker:** NATS (event-driven communication)
- **AI:** Google Gemini API (recommendations, product descriptions)
- **Deployment:** Docker Compose (multi-container)

## Services
- **Auth Service:** User signup/login/logout, role-based access, JWT
- **Product Service:** CRUD, search/filter, event publishing
- **Cart Service:** Add/remove items, sync with stock
- **Order Service:** Create orders, lifecycle, event publishing
- **Payment Service:** Mock payment, event publishing
- **Inventory Service:** Update stock, event publishing
- **Recommendation Service:** AI recommendations, descriptions
- **Analytics Service:** Event consumption, dashboards
- **API Gateway:** Single entry point, JWT validation, routing
- **Message Broker:** NATS for event flow

## Event Flow
1. Order placed → `order.created` event
2. Payment Service consumes → simulates → emits `payment.success`
3. Inventory Service consumes → reduces stock → emits `stock.updated`
4. Analytics Service consumes all events → updates metrics
5. Recommendation Service logs relations for personalization

## Database-per-Service
- Each service uses its own database (MongoDB or PostgreSQL)
- Docker Compose sets up all databases

## Frontend Features
- Customer: Signup/Login, browse/search/filter products, product detail (AI recommendations), cart management, checkout, order history
- Admin: Add/edit/remove products, view analytics dashboard, manage stock

## Analytics Dashboard
- View sales trends, top products, abandoned carts
- Powered by Analytics Service and Next.js dashboard page

## How to Run
1. Clone repo and install dependencies
2. Run `docker-compose up --build` to start all services
3. Access frontend at `http://localhost:3000`
4. API Gateway at `http://localhost:8080`
5. Each service runs on its own port (see `docker-compose.yml`)

## Development Notes
- All progress, todos, and changes tracked in `.github/project-management.md`
- See each service's README for details
- Update documentation as features evolve

---

## Contact & Credits
Created by your team. Powered by Node.js, Next.js, MongoDB, PostgreSQL, NATS, and Google Gemini API.
