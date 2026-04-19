import { createClient } from "redis";

let redisClient;
let isRedisConnected = false;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully.");
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    isRedisConnected = false;
  }
};

export const getRedisClient = () => redisClient;

export const cacheMiddleware = (keyPrefix, expiration = 3600) => {
  return async (req, res, next) => {
    if (!isRedisConnected) {
      console.log("Redis is not connected, skipping cache for:", req.originalUrl);
      return next();
    }

    try {
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      console.log(`Cache miss for key: ${cacheKey}`);
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
    const keys = await redisClient.keys(`${keyPrefix}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared cache for keys starting with: ${keyPrefix}`);
    }
  } catch (err) {
    console.error("Redis clearCache error:", err);
  }
};
