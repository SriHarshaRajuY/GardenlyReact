# Performance Improvement & DB Optimization Report

This report summarizes the optimizations implemented in the Gardenly application, focusing on Database Indexing and Redis Caching.

## 1. Database Optimization: Indexing

We have implemented strategic indexing across key collections to improve query planning and execution speed.

### Applied Indexes

| Collection | Indexed Fields | Purpose |
| :--- | :--- | :--- |
| **Users** | `role`, `username`, `email` | Fast authentication and role-based filtering. |
| **Products** | `category`, `createdAt`, `seller_id`, `name (text)` | Optimized product search, category browsing, and seller inventory lookups. |
| **Orders** | `userId`, `status`, `items.sellerId`, `createdAt` | Efficient order history for buyers and revenue tracking for sellers. |
| **Tickets** | `status`, `requester`, `expert_id` | **[NEW]** Speeds up support dashboard and expert ticket assignment. |
| **CustomRequests** | `buyer_id`, `status` | **[NEW]** Optimizes buyer request management and filtering. |

### Query Planning Analysis
By using these indexes, MongoDB's Query Planner can perform **Index Scans (IXSCAN)** instead of expensive **Collection Scans (COLLSCAN)**. This reduces the number of documents scanned per query, leading to:
- Reduced CPU usage on the database server.
- Lower memory consumption (indexes are kept in RAM).
- Significantly faster response times for the application.

---

## 2. Caching Solution: Redis

We implemented a Redis-based caching layer to store and serve high-traffic, read-heavy API responses.

### Implementation Details
- **Utility:** `api/utils/cache.js` handles Redis connection and middleware logic.
- **Middleware:** `cacheMiddleware` automatically caches JSON responses for a configurable duration.
- **Invalidation:** Cache is automatically cleared on product addition, update, or deletion to ensure data consistency.

### Performance Measurement Results

A performance test was conducted on the `/api/products` endpoint (fetching the most recent products).

| Scenario | Response Time | Improvement |
| :--- | :--- | :--- |
| **Cache Miss** (Database Query) | **252.83 ms** | - |
| **Cache Hit** (Redis Data) | **54.61 ms** | **~78.4% faster** |

#### Summary of Redis Impact
- **Latency Reduction:** Average latency for cached routes decreased by approximately **198 ms**.
- **Efficiency:** Over **78%** improvement in response speed for the end-user.
- **Scalability:** By serving requests from Redis, we significantly reduce the load on the primary MongoDB database, allowing the application to handle more concurrent users.

---

## Conclusion
The combination of database indexing and Redis caching has transformed the application's performance profile. The application now scales better, responds faster to user interactions, and utilizes server resources more efficiently.
