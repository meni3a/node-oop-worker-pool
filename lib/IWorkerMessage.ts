import { WorkerMessageType } from "./workerMessageType";

export interface IWorkerMessage {
    type: WorkerMessageType,
    content: string
}