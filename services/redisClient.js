const redis = require('redis');
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Connected to Redis!");
    }
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();


module.exports = redisClient;
