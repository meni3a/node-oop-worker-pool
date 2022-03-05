import { parentPort } from "worker_threads";
import { IWorkerMessage } from "./IWorkerMessage";
import { WorkerMessageType } from "./workerMessageType";


export abstract class AbstractWorker {
    constructor() {
        parentPort?.on("message", async (workerMessage: IWorkerMessage) => {
            if (workerMessage.type == WorkerMessageType.Data) {
                const result = await this.run(workerMessage.content);
                parentPort?.postMessage(result);
            }
        })
    }
    abstract run(data: any): Promise<any>;
}
