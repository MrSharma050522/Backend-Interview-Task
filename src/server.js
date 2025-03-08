require("dotenv").config();
const express = require("express");
const cluster = require("cluster");
const { taskQueue } = require("./queues/taskQueue");
const workerManager = require("./workers/workerManager");
const startWorker = require("./workers/worker");
const {
	selectLeastLoadedWorker,
	updateWorkerLoad,
} = require("./loadBalancer");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

/**
 * This is a POST API endpoint that allows clients to add a new task to the queue.
 * 
 * When a request is made to this endpoint, the system selects the worker 
 * that currently has the least number of tasks assigned. The task is then 
 * added to the queue and will be processed by that worker.
 * 
 * @route  POST /enqueue-task
 * @desc   Adds a new task to the BullMQ queue
 */
app.post("/enqueue-task", async (req, res) => {
	try {
		// Find the worker that has the least load
		const leastLoadedWorker = selectLeastLoadedWorker();

		// Increase the job count for that worker
		updateWorkerLoad(leastLoadedWorker, 1);

		// Add the job to the queue, assigning it to the selected worker
		const job = await taskQueue.add(
			process.env.QUEUE_NAME || "taskQueue",
			{ workerId: leastLoadedWorker }, // Store worker information in the job data
			{ removeOnComplete: true } // Once the job is done, remove it from the queue
		);

		// Respond with a success message and details of the job
		res.status(200).json({
			message: "Task has been added to the queue",
			jobId: job.id,
			assignedWorker: leastLoadedWorker,
		});
	} catch (error) {
		// If something goes wrong, send an error response
        console.error("Error -> ", error);
		res.status(500).json({ error: "Failed to add task to the queue" });
	}
});

/**
 * This section of code checks if the current process is the main process.
 * 
 * - If it is the main process, it starts multiple worker processes.
 * - If it is a worker process, it starts handling jobs from the queue.
 */
if (cluster.isMaster) {
	console.log(`Main process ${process.pid} is running`);

	// Start multiple worker processes to process jobs in parallel
	workerManager.startCluster();

	// Start the Express server to handle API requests
	app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
} else {
	// If this is a worker process, start processing jobs from the queue
	console.log(`Worker process ${process.pid} has started`);
	startWorker();
}
