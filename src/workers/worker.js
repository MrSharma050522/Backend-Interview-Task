require("dotenv").config();
const { Worker } = require("bullmq");
const { redisConnection } = require("../config/redis");
const { updateWorkerLoad } = require("../loadBalancer");

/**
 * Starts a worker that listens for jobs in the queue and processes them.
 * 
 * Each worker picks up tasks from the queue and processes them one by one.
 * If a job fails, it will retry up to 3 times before being marked as failed.
 */
function startWorker() {
	const worker = new Worker(
        // The queue from which jobs will be processed
		process.env.QUEUE_NAME || "taskQueue",
		async (job) => {
			console.log(`Worker ${process.pid} is processing job ${job.id}...`);
			
			// Simulating a 12-second task to mimic processing time
			await new Promise((resolve) => setTimeout(resolve, 12000));

			console.log(`Worker ${process.pid} has completed job ${job.id}.`);
			
			// Reduce job count for the worker after completion
			updateWorkerLoad(job.data.workerId, -1);
		},
		{
            // Connects to Redis for job processing
			connection: redisConnection,
            // Each worker can process up to 8 jobs at the same time
			concurrency: 8,
		}
	);

	/**
	 * Handles job failures.
	 * 
	 * If a job fails, it reduces the worker's job count and retries the job 
	 * up to 3 times before marking it as permanently failed.
	 */
	worker.on("failed", async (job, err) => {
		console.log(`Job ${job.id} failed due to error: ${err.message}`);

		// Reduce worker job count since the job failed
		updateWorkerLoad(job.data.workerId, -1);

		// Retry the job if it has not exceeded 3 attempts
		if (job.attemptsMade < 3) {
			await job.retry();
		}
	});
}

module.exports = startWorker;
