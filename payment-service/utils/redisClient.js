const IORedis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new IORedis(REDIS_URL);

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (e) => console.error("Redis error", e));

module.exports = redis;
