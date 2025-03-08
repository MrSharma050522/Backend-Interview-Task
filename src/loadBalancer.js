// Keeps track of the number of active jobs assigned to each worker
const workerLoad = {};

/**
 * Initializes the worker load tracking.
 * 
 * This function sets the job count for each worker to zero at the start
 * since no worker has any jobs assigned when the system starts.
 */
function initializeLoadBalancer(workerIds) {
	workerIds.forEach((workerId) => {
		workerLoad[workerId] = 0; // Set the initial job count to 0
	});
}

/**
 * Finds the worker with the least number of active jobs.
 * 
 * This function goes through all workers and selects the one that has 
 * the lowest job count so that new tasks can be assigned fairly.
 */
function selectLeastLoadedWorker() {
	return Object.keys(workerLoad).reduce((leastLoaded, workerId) => {
		return workerLoad[workerId] < workerLoad[leastLoaded]
			? workerId
			: leastLoaded;
	});
}

/**
 * Updates the job count for a worker.
 * 
 * When a new task is assigned to a worker, this function increases 
 * the count for that worker. If a task is completed, the count is reduced.
 */
function updateWorkerLoad(workerId, change) {
	if (workerLoad[workerId] !== undefined) {
		workerLoad[workerId] += change;
	}
}

module.exports = {
	initializeLoadBalancer,
	selectLeastLoadedWorker,
	updateWorkerLoad,
};
