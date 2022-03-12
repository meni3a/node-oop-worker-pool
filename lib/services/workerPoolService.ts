import OS from 'os';
import { WorkerMessageType } from "../enums/workerMessageType";
import { ITaskData } from "../Interfaces/ITaskData";
import { WorkerThread } from '../models/WorkerThread';
import { WorkerEventType } from '../enums/WorkerEventType';


export class WorkerPoolService {

    private static _instance: WorkerPoolService;

    private workingWorkers = new Map<WorkerThread, ITaskData>();
    private waitingTaskQueue: ITaskData[] = [];

    private totalAvailableWorkers;
    private numOfFreeWorkers;

    private constructor() {
        this.totalAvailableWorkers = OS.cpus().length;
        this.numOfFreeWorkers = this.totalAvailableWorkers;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private createWorker(taskData: ITaskData) {
        this.numOfFreeWorkers -= 1;
        const worker = new WorkerThread(taskData.fileName);
        this.workingWorkers.set(worker, taskData)

        worker.postMessage({
            type: WorkerMessageType.Data,
            content: taskData.data
        });

        worker
            .on(WorkerEventType.Message, (result) => {
                this.handleEndOfTask(worker)?.resolve(result);
            })
            .on(WorkerEventType.Error, (err) => {
                console.log(err.message)
                this.handleEndOfTask(worker)?.reject(err);
            })
            .on(WorkerEventType.Exit, (code) => {
                if (code !== 0) {
                    this.handleEndOfTask(worker)?.reject(new Error(`Worker exited with code ${code}`));
                }
            });

        return worker;
    }


    private handleEndOfTask(worker: WorkerThread): ITaskData | undefined {
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
        for (const [worker, d] of this.workingWorkers) worker.terminate();
        this.workingWorkers = new Map<WorkerThread, ITaskData>();
        this.waitingTaskQueue = []
        this.numOfFreeWorkers = this.totalAvailableWorkers;
    }


    setTotalAvailableWorkers(amount: number): void {
        if (this.numOfFreeWorkers === this.totalAvailableWorkers) {
            this.totalAvailableWorkers = amount;
            this.numOfFreeWorkers = this.totalAvailableWorkers;
        }
        else {
            throw new Error("Can't change total available workers, because there are working workers")
        }
    }
}

