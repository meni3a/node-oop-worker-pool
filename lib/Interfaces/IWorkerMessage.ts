import { WorkerMessageType } from "../enums/workerMessageType";


export interface IWorkerMessage {
    type: WorkerMessageType,
    content: string
}