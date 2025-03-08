// Keeps track of the number of active jobs assigned to each worker
const workerLoad = {};

/**
 * Initializes the worker load tracker.
 * 
 * This function sets the job count for each worker to zero when the system starts,
 * ensuring all workers begin with no assigned jobs.
 * 
 * @param {string[]} workerIds - Array of worker IDs to initialize.
 * @returns {Object} The updated workerLoad object.
 */
function initializeLoadBalancer(workerIds) {
	workerIds.forEach((workerId) => {
		workerLoad[workerId] = 0; // Initialize job count to 0
	});
	return workerLoad;
}

/**
 * Handles worker replacement when an existing worker is removed.
 * 
 * This function removes the old worker from tracking and initializes the new worker
 * with zero active jobs to maintain workload balance.
 * 
 * @param {string} newWorkerId - The ID of the newly added worker.
 * @param {string} oldWorkerId - The ID of the worker being removed.
 * @returns {Object} The updated workerLoad object.
 */
function processNewWorker(newWorkerId, oldWorkerId) {
	delete workerLoad[oldWorkerId]; // Remove the old worker
	workerLoad[newWorkerId] = 0; // Initialize the new worker with 0 jobs
	return workerLoad;
}

/**
 * Selects the worker with the least number of active jobs.
 * 
 * This function iterates through all tracked workers and finds the one 
 * with the lowest job count to ensure fair job distribution.
 * 
 * @returns {string} The ID of the least loaded worker.
 */
function selectLeastLoadedWorker() {
	return Object.keys(workerLoad).reduce((leastLoaded, workerId) => {
		return workerLoad[workerId] < workerLoad[leastLoaded] ? workerId : leastLoaded;
	});
}

/**
 * Updates the job count for a specific worker.
 * 
 * This function increases or decreases a worker’s job count based on the assigned change.
 * It ensures that job assignments and completions are properly tracked.
 * 
 * @param {string} workerId - The ID of the worker whose load needs to be updated.
 * @param {number} change - The amount to adjust the job count (positive for assignments, negative for completions).
 * @returns {Object} The updated workerLoad object.
 */
function updateWorkerLoad(workerId, change) {
	if (workerLoad[workerId] !== undefined) {
		workerLoad[workerId] += change;
	}
	return workerLoad;
}

module.exports = {
	initializeLoadBalancer,
	selectLeastLoadedWorker,
	updateWorkerLoad,
	processNewWorker
};
