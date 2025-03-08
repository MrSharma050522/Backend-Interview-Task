require("dotenv").config();
const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis");

/**
 * Creates a queue that holds tasks to be processed by workers.
 * 
 * This queue acts as a storage where jobs are added and later picked up
 * by available workers for processing.
 */
const taskQueue = new Queue(process.env.QUEUE_NAME || "taskQueue", {
	connection: redisConnection, // Connects to Redis for queue management
});

module.exports = { taskQueue };
