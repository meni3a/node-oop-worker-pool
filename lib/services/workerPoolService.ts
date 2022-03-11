import OS from 'os';
import { Worker } from "worker_threads";
import { WorkerMessageType } from "../enums/workerMessageType";
import { ITaskData } from "../Interfaces/ITaskData";
import { IWorkerMessage } from "../Interfaces/IWorkerMessage";
import { targetWorkerConfigPath } from "../workers/targetWorkerConfig";


export class WorkerPoolService {

    private static _instance: WorkerPoolService;

    private workingWorkers = new Map<Worker, ITaskData>();
    private waitingTaskQueue: ITaskData[] = [];

    private TOTAL_AVAILABLE_WORKERS;
    private numOfFreeWorkers;
 
    private constructor() {
        this.TOTAL_AVAILABLE_WORKERS = OS.cpus().length;
        this.numOfFreeWorkers = this.TOTAL_AVAILABLE_WORKERS;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private createWorker(taskData: ITaskData) {
        this.numOfFreeWorkers -= 1;
        const worker = new Worker(targetWorkerConfigPath);
        this.workingWorkers.set(worker, taskData)

        const configure: IWorkerMessage = {
            type: WorkerMessageType.Configure,
            content: taskData.fileName
        }

        worker.postMessage(configure)

        const data: IWorkerMessage = {
            type: WorkerMessageType.Data,
            content: taskData.data
        }
        worker.postMessage(data);

        worker
            .on("message", (result) => {
                this.handleEndOfTask(worker)?.resolve(result);
            })
            .on("error", (err) => {
                console.log(err.message)
                this.handleEndOfTask(worker)?.reject(err);
            });

        return worker;
    }

    private handleEndOfTask(worker: Worker): ITaskData | undefined {
        const workerData = this.workingWorkers.get(worker);
        this.workingWorkers.delete(worker);
        this.numOfFreeWorkers += 1;
        this.handleFreeWorker();

        return workerData;
    }

    private handleFreeWorker() {
        const currentData = this.waitingTaskQueue.pop();
        if (currentData) {
            this.createWorker(currentData)
        }
    }

    runTask(data: any, fileName: string) {

        return new Promise((resolve, reject) => {
            const taskData: ITaskData = {
                fileName,
                data,
                resolve,
                reject
            }
            if (this.numOfFreeWorkers === 0) {
                this.waitingTaskQueue.unshift(taskData);
            }
            else {
                this.createWorker(taskData)
            }
        });
    }

    destroy() {
        for (let [worker, data] of this.workingWorkers) {
            worker.terminate();
        }
        this.clear();
    }

    private clear() {
        this.workingWorkers = new Map<Worker, ITaskData>();
        this.waitingTaskQueue = []
        this.numOfFreeWorkers = this.TOTAL_AVAILABLE_WORKERS;
    }

    setTotalAvailableWorkers(num: number): void {
        if(this.numOfFreeWorkers===this.TOTAL_AVAILABLE_WORKERS){
            this.TOTAL_AVAILABLE_WORKERS = num;
            this.numOfFreeWorkers = this.TOTAL_AVAILABLE_WORKERS;
        }
        else{
            throw new Error("Can't change total available workers, because there are working workers")
        }
    }
}
