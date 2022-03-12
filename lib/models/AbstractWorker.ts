import { parentPort } from "worker_threads";
import { WorkerEventType } from "../enums/WorkerEventType";
import { WorkerMessageType } from "../enums/workerMessageType";
import { IWorkerMessage } from "../Interfaces/IWorkerMessage";


export abstract class AbstractWorker {
    constructor() {
        parentPort?.on(WorkerEventType.Message, async (workerMessage: IWorkerMessage) => {
            if (workerMessage.type === WorkerMessageType.Data) {
                const result = await this.runTask(workerMessage.content);
                parentPort?.postMessage(result);
            }
        })
    }
    abstract runTask(data: any): Promise<any>;
}
