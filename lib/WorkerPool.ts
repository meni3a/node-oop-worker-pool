import { Worker } from "worker_threads";
import OS from 'os';
import { IWorkerMessage } from "./IWorkerMessage";
import { WorkerMessageType } from "./workerMessageType";
import path from "path";
import { ITaskData } from "./ITaskData";


export class WorkerPool {

    private static _instance: WorkerPool;

    private workingWorkers = new Map<Worker, ITaskData>();
    private waitingTaskQueue: ITaskData[] = [];

    private TOTAL_AVIABLE_WOREKERS;
    private numOfFreeWorkers;
 
    private constructor() {
        this.TOTAL_AVIABLE_WOREKERS = OS.cpus().length;
        this.numOfFreeWorkers = this.TOTAL_AVIABLE_WOREKERS;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    chunkArray(array:any[], chunk_size:number){
        const results = [];
        while (array.length) {
            results.push(array.splice(0, chunk_size));
        }
        return results;
    }

    setTotalAviableWorkers(num: number): void {
        if(this.numOfFreeWorkers===this.TOTAL_AVIABLE_WOREKERS){
            this.TOTAL_AVIABLE_WOREKERS = num;
            this.numOfFreeWorkers = this.TOTAL_AVIABLE_WOREKERS;
        }
        else{
            throw new Error("Can't change total aviable workers, because there are working workers")
        }
    }
    private createWorker(taskData: ITaskData) {
        this.numOfFreeWorkers -= 1;
        const worker = new Worker(path.resolve(__dirname, './targetFile.js'));
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
                console.log(result)
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
        this.numOfFreeWorkers = this.TOTAL_AVIABLE_WOREKERS;
    }
}

