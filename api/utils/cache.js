import { createClient } from "redis";

let redisClient;
let isRedisConnected = false;
const shouldLogCache = () => process.env.NODE_ENV !== "production";

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeoutMS: 5000
      }
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully.");
      isRedisConnected = true;
    });

    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis connection timed out")), 5000))
    ]);
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    isRedisConnected = false;
  }
};

export const getRedisClient = () => redisClient;

export const cacheMiddleware = (keyPrefix, expiration = 3600) => {
  return async (req, res, next) => {
    if (!isRedisConnected) {
      if (shouldLogCache()) console.log("Redis is not connected, skipping cache for:", req.originalUrl);
      return next();
    }

    try {
      // Append user ID to cache key if user is authenticated (to avoid leaking private data)
      const userSuffix = req.user && req.user.id ? `:user:${req.user.id}` : '';
      const cacheKey = `${keyPrefix}:${req.originalUrl}${userSuffix}`;
      
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        if (shouldLogCache()) console.log(`Redis cache HIT for key: ${cacheKey}`);
        res.setHeader('X-Redis-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cachedData));
      }

      if (shouldLogCache()) console.log(`Redis cache MISS for key: ${cacheKey}`);
      res.setHeader('X-Redis-Cache', 'MISS');
      
      // Override res.json to intercept the response and cache it
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(cacheKey, expiration, JSON.stringify(body)).catch(err => {
            console.error("Redis set error:", err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Redis cache middleware error:", err);
      next(); // Fail gracefully
    }
  };
};

export const clearCache = async (keyPrefix) => {
  if (!isRedisConnected) return;

  try {
    let cursor = "0";
    let totalCleared = 0;
    
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: `${keyPrefix}:*`,
        COUNT: 100,
      });
      cursor = reply.cursor;
      const keys = reply.keys;

      if (keys.length > 0) {
        await redisClient.del(keys);
        totalCleared += keys.length;
      }
    } while (cursor !== "0");

    if (totalCleared > 0) {
      console.log(`Cleared ${totalCleared} cache keys starting with: ${keyPrefix}`);
    }
  } catch (err) {
    console.error("Redis clearCache error:", err);
  }
};
