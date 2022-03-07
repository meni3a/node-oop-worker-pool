import 'reflect-metadata'

import { WorkerPool } from './lib/WorkerPool'

const workerPool = WorkerPool.Instance;

export default workerPool as WorkerPool;
export * from './lib/AbstractWorker'