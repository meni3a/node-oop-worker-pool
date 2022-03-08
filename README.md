
  
#  node-oop-worker-pool

node-oop-worker-pool is a NodeJS library for dealing with multi threaded programing in a OOP approach.

##  Installation

Use the package manager [npm](https://www.npmjs.com/package/node-oop-worker-pool) to install node-oop-worker-pool.

```bash

npm install node-oop-worker-pool

```

##  Usage
### Main file:

Use WorkerPool.runTask() run task in a new thread, if there are more tasks then available workers it will wait in the queue.

Example:

```ts

import WorkerPool from "node-oop-worker-pool";
import ComputeService from "./computeService";

class MainService{

    async handleCPUIntensiveTask(dataToProcess: number[]){ 
        
        // wait all workers to finish
        const result = await Promise.all(dataToProcess.map((data: number)=>{
            return WorkerPool.runTask(data, ComputeService.path);
        }));
    
        console.log("finish all tasks", result);
    
        WorkerPool.destroy();
    }
	
}

const mainService = new MainService();
mainService.handleCPUIntensiveTask([1,2,3,4,5,6,7,8,9,10,11]);

```

### Worker file:
Must inherit from **AbstractWorker**, and implement the method **run()** the method receive the data from the main file, and will also return the result to the main file.

```ts
import { AbstractWorker } from 'node-oop-worker-pool';

export default class ComputeService extends AbstractWorker {

	// optional way to expose the path to the main file
    static path = __filename;

	// when the worker starts, this function will be called automatically.
    async run(data: number): Promise<number> {
        console.log("start processing data: ", data);
        // example of thread blocking task
        for (let i = 0; i < 9999999999; i++);
		// modified the data
        const modifiedData = data*2;
		//return data to main file
		return modifiedData;
    }

}
```
##  Process data with chunks

## Main file:

```ts

const CHUNK_SIZE = 3;
const rawData : number[] = [1,2,3,4,5,6,7,8,9,10,11];

const dataToProcess = WorkerPool.chunkArray(rawData, CHUNK_SIZE);

const result = await Promise.all(dataToProcess.map((data: number[])=>{
	return WorkerPool.runTask(data, ComputeService.path);
}));

console.log("finish all tasks", result);

WorkerPool.destroy();
    

```
### Worker file:

```ts
export default class ComputeService extends AbstractWorker {

    static path = __filename;

    async run(chunk: number[]): Promise<boolean[]> {

        console.log("start processing data: ", chunk);

        const modifiedChunk = data.map((num: number)=>{
            return this.processData(num);
        });

        return modifiedChunk;
    }

    processData(data: number) : boolean{
		if(!data){
			return false;
		}
        for (let i = 0; i < 9999999999; i++);
        return true;
    }
}
```

## Control max available workers:

```ts
import OS from 'os';

//default
WorkerPool.setTotalAvailableWorkers(OS.cpus().length);

//custom
WorkerPool.setTotalAvailableWorkers(30);

```


##  Public method

- setTotalAvailableWorkers() - Change number of available workers.

- destroy() - Terminate all workers, force end of all tasks and empty the queue.

- chunkArray() - Allows you to split array to chunks, in order to handle large array using workers.


##  License

[MIT](https://choosealicense.com/licenses/mit/)