import { WorkerPoolService } from './lib/services/workerPoolService';

const workerPool = WorkerPoolService.Instance;
export {workerPool as WorkerPool};

export * from './lib/models/AbstractWorker';
export * from './lib/utils/util';