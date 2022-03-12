import { parentPort } from 'worker_threads';
import { WorkerEventType } from '../enums/WorkerEventType';
import { WorkerMessageType } from '../enums/workerMessageType';
import { IWorkerMessage } from '../Interfaces/IWorkerMessage';

export const targetWorkerConfigPath = __filename;

(async () => {
    parentPort?.on(WorkerEventType.Message, async (workerMessage: IWorkerMessage) => {
        if (workerMessage.type === WorkerMessageType.Configure) {
            const target = await import(workerMessage.content);
            new target.default();
        }
    })
})()

