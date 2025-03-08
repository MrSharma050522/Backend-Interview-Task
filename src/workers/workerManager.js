require("dotenv").config();
const cluster = require("cluster");
const { initializeLoadBalancer } = require("../loadBalancer");

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
			workerIds.push(worker.id);
		}

		// Initialize load balancer with worker IDs
		initializeLoadBalancer(workerIds);

		// If a worker crashes, create a new one to replace it
		cluster.on("exit", (worker) => {
			console.log(`Worker ${worker.process.pid} has stopped, starting a new worker...`);
			const newWorker = cluster.fork();
			workerIds.push(newWorker.id);
			initializeLoadBalancer(workerIds);
		});
	}
}

module.exports = { startCluster };
