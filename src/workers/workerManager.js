require("dotenv").config();
const cluster = require("cluster");
const { initializeLoadBalancer, processNewWorker} = require("../loadBalancer");

// Defines the number of worker processes to create
const WORKER_COUNT = process.env.WORKER_COUNT || 4;
const workerIds = [];

/**
 * Starts the clustering system.
 * 
 * This function creates multiple worker processes that run in parallel.
 * It also keeps track of worker processes and restarts any that crash.
 */
function startCluster() {
	if (cluster.isMaster) {
		// Create the specified number of worker processes
		for (let i = 0; i < WORKER_COUNT; i++) {
			const worker = cluster.fork();
			workerIds.push(worker.process.pid); // Store worker process ID
		}

		// Initialize the load balancer with worker IDs to track job distribution
		const workerStatus = initializeLoadBalancer(workerIds);
		// Uncomment to monitor the task distribution among workers
		// console.table(workerStatus);

		// Handle worker crashes and automatically replace them
		cluster.on("exit", (worker) => {
			console.log(`Worker ${worker.process.pid} has stopped. Launching a new worker...`);
			
			// Start a new worker to replace the one that stopped
			const newWorker = cluster.fork();
			workerIds.push(newWorker.process.pid); // Add the new worker's ID to the list

			// Remove the old worker's ID from the list
			const index = workerIds.indexOf(worker.process.pid);
			if (index !== -1) {
				workerIds.splice(index, 1);
			}

			// Update the load balancer: remove the old worker and initialize the new one with zero jobs
			const updatedWorkerLoadStatus = processNewWorker(newWorker.process.pid, worker.process.pid);

			// Uncomment to monitor worker loads after replacement
			// console.table(updatedWorkerLoadStatus);
		});
	}
}

module.exports = { startCluster };
