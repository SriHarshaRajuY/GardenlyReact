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

## 3. Product Search Optimization

The application currently uses MongoDB text indexes for product search. Product names are weighted highest, followed by category and description, so relevant matches appear before broader matches.

### Technical Implementation
- **Search engine:** MongoDB text search through a weighted product text index.
- **Indexed fields:** Product name, category, and description.
- **API route:** `/api/products/search?q=...`.
- **Caching:** Search responses are cached through the Redis middleware with a shorter TTL than general product listings.

### Impact on User Experience
- **Relevant catalog search:** Product names receive higher ranking than category or description text.
- **Lower query cost:** Indexed search avoids broad collection scans for common catalog queries.
- **Cache support:** Repeated search requests can be served from Redis when the cache is warm.

---

## 4. Visual Monitoring Dashboards

The following official platforms are used to manage and monitor the optimized stack visually:

1.  **Redis Dashboard:** [console.upstash.com](https://console.upstash.com) - Real-time metrics for caching.
2.  **MongoDB Atlas Dashboard:** Used to inspect collection indexes, query performance, and database health.

---

## Conclusion
The application now utilizes Redis caching, MongoDB indexing, and weighted catalog search to improve read-heavy product workflows while keeping the architecture simple enough to maintain and extend.
