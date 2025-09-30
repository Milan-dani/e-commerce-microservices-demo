
# Frontend – E-Commerce Microservices Demo

## Overview
This Next.js frontend provides customer and admin interfaces for the e-commerce microservices platform.

## Features
- Authentication (signup/login/logout)
- Product browsing, search, and filter
- Product detail page with AI recommendations
- Cart management (add/remove/update)
- Checkout and order flow
- Order history for customers
- Admin product management (CRUD)
- Analytics dashboard for admin
- Global navigation and polished UI/UX

## Pages
- `/auth` – Login/Signup
- `/products` – Browse/search/filter products
- `/products/[id]` – Product details + recommendations
- `/cart` – View and manage cart
- `/checkout` – Place orders
- `/orders` – Customer order history
- `/admin/products` – Admin product CRUD
- `/admin/dashboard` – Admin analytics dashboard

## API Integration
- Communicates with API Gateway (`http://localhost:8080`) for all backend services
- Uses JWT for authentication

## Development
- Built with Next.js (TypeScript)
- Simple inline styles for demo purposes
- Update endpoints and user context as needed for production

## How to Run
1. Start all backend services and databases with Docker Compose
2. Run `npm install` in `frontend/` directory
3. Run `npm run dev` to start frontend locally
4. Access at `http://localhost:3000`

---

## Notes
- For full functionality, ensure all backend services are running
- Update user context and authentication flow for production use
- Extend UI/UX and add advanced features as needed
