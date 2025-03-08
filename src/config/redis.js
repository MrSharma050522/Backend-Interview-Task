require("dotenv").config();
const Redis = require("ioredis");

/**
 * Establishes a connection to the Redis server.
 * 
 * This Redis client is used to manage queues and store job-related data
 * for BullMQ workers.
 */
const redisConnection = new Redis({
	host: process.env.REDIS_HOST || "127.0.0.1", // Redis server hostname
	port: process.env.REDIS_PORT || 6379, // Redis server port
	maxRetriesPerRequest: null, // Prevents request retries (required for BullMQ)
	enableReadyCheck: false, // Skips extra readiness checks for faster connection
});

/**
 * Logs a message when the Redis connection is successfully established.
 */
redisConnection.on("connect", () => console.log("Redis connected!"));

/**
 * Logs an error message if Redis fails to connect or encounters an issue.
 */
redisConnection.on("error", (err) => console.error("Redis Error:", err));

module.exports = { redisConnection };
