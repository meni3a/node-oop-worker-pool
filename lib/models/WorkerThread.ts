import { Worker } from "worker_threads";
import { WorkerMessageType } from "../enums/workerMessageType";
import { IWorkerMessage } from "../Interfaces/IWorkerMessage";
import { targetWorkerConfigPath } from "../workers/targetWorkerConfig";

export class WorkerThread extends Worker {
    constructor(path:string) {
        super(targetWorkerConfigPath);
        this.postMessage({
            type: WorkerMessageType.Configure,
            content: path
        });
    }
    
    postMessage(message: IWorkerMessage): void {
        super.postMessage(message);
    };
}