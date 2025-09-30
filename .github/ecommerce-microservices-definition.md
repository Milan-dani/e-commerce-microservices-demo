# 🛒 E-Commerce Microservice Demo – Project Definition

## 🎯 Goal
A feature-rich **E-Commerce platform** built with **microservices architecture**, **Next.js frontend**, **Node.js backend**, and **Google Gemini AI**.  
It demonstrates:  
- Service isolation.  
- Event-driven communication.  
- AI-powered recommendations.  
- Database-per-service.  
- API Gateway.  
- Dockerized deployment (future).  

---

## 🏗️ Services

### 1. Auth Service
- **Tech:** Node.js, MongoDB, JWT.  
- **Responsibilities:**
  - User signup/login/logout.  
  - Role-based access (Customer/Admin).  
  - JWT token issuance + validation.  
- **Collections:** Users (username, email, password hash, role).  

---

### 2. Product Service
- **Tech:** Node.js, MongoDB.  
- **Responsibilities:**
  - CRUD products (admin).  
  - Search & filter products.  
  - Publishes `product.updated` events.  
- **Collections:** Products (name, price, description, stock, category).  

---

### 3. Cart Service
- **Tech:** Node.js, MongoDB.  
- **Responsibilities:**
  - Add/remove items to user’s cart.  
  - Sync with product stock.  
- **Collections:** Carts (userId, items [productId, quantity]).  

---

### 4. Order Service
- **Tech:** Node.js, PostgreSQL.  
- **Responsibilities:**
  - Create orders (from cart).  
  - Order lifecycle (Pending → Paid → Shipped).  
  - Publishes `order.created`.  
- **Tables:** Orders, OrderItems.  

---

### 5. Payment Service (Mock)
- **Tech:** Node.js.  
- **Responsibilities:**
  - Listens to `order.created`.  
  - Simulates payment (approve/decline).  
  - Publishes `payment.success` or `payment.failed`.  

---

### 6. Inventory Service
- **Tech:** Node.js, MongoDB.  
- **Responsibilities:**
  - Update stock after successful payment.  
  - Publishes `stock.updated`.  
- **Collections:** Inventory (productId, stock).  

---

### 7. Recommendation Service (AI)
- **Tech:** Node.js, Google Gemini API.  
- **Responsibilities:**
  - Suggest “related products”.  
  - Generate product descriptions.  
  - Optional: personalized recommendations.  

---

### 8. Analytics Service
- **Tech:** Node.js, MongoDB.  
- **Responsibilities:**
  - Consume events (orders, payments, inventory).  
  - Provide dashboards:  
    - Sales trends.  
    - Top products.  
    - Abandoned carts.  
- **Collections:** Events, Metrics.  

---

### 9. API Gateway
- **Tech:** Express.js.  
- **Responsibilities:**
  - Single entry point for frontend.  
  - Routes requests to services.  
  - Handles JWT validation.  

---

### 10. Message Broker
- **Options:** Kafka / RabbitMQ / NATS.  
- **Used For:**  
  - `order.created` → Payment.  
  - `payment.success` → Inventory, Analytics.  
  - `stock.updated` → Product, Analytics.  

---

## 🗄️ Databases
- Auth → MongoDB.  
- Product → MongoDB.  
- Cart → MongoDB.  
- Order → PostgreSQL.  
- Inventory → MongoDB.  
- Analytics → MongoDB.  

---

## 🌐 Frontend (Next.js)
### Customer Features:
- Signup/Login.  
- Browse/search/filter products.  
- Product detail page (AI recommendations).  
- Cart management.  
- Checkout → order + payment flow.  
- Order history.  

### Admin Features:
- Add/edit/remove products.  
- View analytics (charts, KPIs).  
- Manage stock.  

---

## 🤖 AI Integration
- **Google Gemini API** via Recommendation Service.  
- Use cases:  
  - Suggest “related products”.  
  - Generate marketing-style product descriptions.  

---

## 🔌 Event Flow
1. Customer places order → **Order Service** emits `order.created`.  
2. **Payment Service** consumes → simulates → emits `payment.success`.  
3. **Inventory Service** consumes → reduces stock → emits `stock.updated`.  
4. **Analytics Service** consumes all events → updates metrics.  
5. **Recommendation Service** can log relations for personalization.  

---

## 📊 Demo Flow
1. User signs up & logs in.  
2. Browses products (AI recommendations visible).  
3. Adds products to cart → checks out.  
4. Order triggers payment & inventory updates.  
5. Admin logs in → sees analytics dashboard.  
6. Admin adds a product → AI generates description.  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, TailwindCSS, Recharts/Chart.js.  
- **Backend:** Node.js (Express/Fastify).  
- **Databases:** MongoDB, PostgreSQL.  
- **Message Broker:** Kafka/RabbitMQ/NATS.  
- **Auth:** JWT.  
- **AI:** Google Gemini API.  
- **Deployment:** Local dev → Docker Compose (multi-container).  

---

## 📂 Suggested Folder Structure
```
ecommerce-microservices/
  api-gateway/
  auth-service/
  product-service/
  cart-service/
  order-service/
  payment-service/
  inventory-service/
  recommendation-service/
  analytics-service/
  frontend/ (Next.js)
  message-broker/ (config)
  docker-compose.yml
```
