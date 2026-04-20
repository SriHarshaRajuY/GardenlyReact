<div align="center">
  <img src="https://img.icons8.com/?size=100&id=103424&format=png&color=16A34A" alt="Gardenly Logo" width="80" height="80">
  <h1 align="center">Gardenly</h1>
  <p align="center">
    <strong>Bring Nature Closer to Home 🌿</strong>
    <br />
    An Enterprise-Grade B2B & B2C MERN E-Commerce Platform
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture-highlights">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#api-documentation">API Docs</a>
  </p>
</div>

---

## 📖 About The Project

**Gardenly** is a comprehensive, high-performance web application designed for gardening enthusiasts, commercial sellers, and botanical experts. It bridges the gap between buyers looking for premium plants/seeds and sellers wanting to expand their reach, while also providing a real-time community hub and expert ticketing system.

This project was built focusing on **Enterprise Architecture**, prioritizing performance optimization, caching, microservice-like integration, and beautiful UX.

## ✨ Features

- **Multi-Role System (B2B & B2C):** Dedicated dashboards and permissions for `Buyers`, `Sellers`, `Experts`, and `Admin`.
- **Lightning Fast Search:** Integrated **Apache Solr** for highly relevant, typo-tolerant, enterprise-level product searching.
- **Real-Time Community:** Built-in forums and chat functionality powered by **Socket.io**.
- **Performance Optimized:** API response caching implemented using **Redis**, reducing load times by ~78%.
- **Secure Authentication:** Cookie-based JWT authentication paired with secure **Google OAuth** login.
- **Custom Requests:** A dynamic marketplace where buyers can post custom requirements and sellers can bid/submit proposals.
- **Expert Support System:** An integrated ticketing system allowing users to get help directly from assigned gardening experts.
- **Cloud Media Storage:** Direct integration with **Cloudinary** for lightning-fast, optimized image delivery.
- **Beautiful UI/UX:** Fully responsive, premium design with Dark/Light mode, built with **Tailwind CSS**.

## 🛠 Tech Stack

**Frontend:**
- React.js (Vite)
- Redux Toolkit & Context API (State Management)
- Tailwind CSS (Styling)
- React Router DOM (Routing)
- Swiper.js (Touch Sliders)
- Google Identity Services

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- Redis (In-memory caching via Upstash)
- Apache Solr (Search Engine via WebSolr)
- Socket.io (WebSockets)
- Swagger / OpenAPI (API Documentation)
- JSON Web Tokens (JWT)

**DevOps & Infrastructure:**
- Docker & Docker Compose
- GitHub Actions (CI/CD Pipeline)
- Vercel (Frontend Deployment)
- Render/Railway (Backend Deployment)

## 🏗 Architecture Highlights

- **Database Optimization:** Strategic indexing on high-traffic fields (`username`, `role`, `category`) resulting in `IXSCAN` operations over expensive `COLLSCAN`s.
- **Caching Layer:** Custom Express middleware intercepting read-heavy routes to serve cached payloads from Redis.
- **Containerization:** Separate Dockerfiles for client and backend, with a unified `docker-compose.yml` for isolated local development.
- **Test-Driven:** Comprehensive unit testing using Jest/Vitest for critical controllers and logic.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB instance (Local or Atlas)
- Redis instance (Local or Upstash)
- Docker (Optional, for containerized run)

### 1. Clone the repository
```bash
git clone https://github.com/SriHarshaRajuY/GardenlyReact.git
cd GardenlyReact
```

### 2. Environment Variables
Create a `.env` file in the root directory. Use `.env.example` as a template and fill in your credentials for:
- `MONGO_URI`
- `REDIS_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`

### 3. Run Locally (Standard)

**Backend:**
```bash
cd api
npm install
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

### 4. Run via Docker
```bash
docker-compose up --build
```
*Frontend will be available at `http://localhost:5173` and Backend at `http://localhost:3000`.*

## 📚 API Documentation

Gardenly uses **Swagger UI** for interactive API documentation. 
Once the backend server is running, navigate to:

```text
http://localhost:3000/api-docs
```
Here you can explore all endpoints, required payloads, and test requests directly from the browser.

## 🧪 Testing

To run the automated test suite and view coverage:
```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
<div align="center">
  <i>Developed with ❤️ by the Gardenly Team</i>
</div>
