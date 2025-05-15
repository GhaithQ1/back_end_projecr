const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

module.exports = redisClient;
