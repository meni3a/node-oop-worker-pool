import { parentPort } from 'worker_threads';
import { IWorkerMessage } from './IWorkerMessage';
import { WorkerMessageType } from './workerMessageType';

(async () => {
    parentPort?.on("message", async (workerMessage: IWorkerMessage) => {
        if (workerMessage.type == WorkerMessageType.Configure) {
            const target = await import(workerMessage.content);
            new target.default();
        }
    })
})()

