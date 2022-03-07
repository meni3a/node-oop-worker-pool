
  
#  node-oop-worker-pool

node-oop-worker-pool is a NodeJS library for dealing with multi threaded programing in a OOP approach.

##  Installation

Use the package manager [npm](https://www.npmjs.com/package/node-oop-worker-pool) to install node-oop-worker-pool.

```bash

npm install node-oop-worker-pool

```

##  Usage
### Main file:

Use WorkersPool.Task() start tasl in a new thread, if there are more tasks then aviable workers it will wait in the quque.

Example:

```ts

import { WorkerPool } from "node-oop-worker-pool";
import ComputeService from "./computeService";


(async () => {
    
    const promises = [];
    for (const data of Array.from(Array(100).keys())) {
        const task = WorkerPool.runTask(data, ComputeService.path);
        promises.push(task);
    }

    await Promise.all(promises);
    WorkerPool.destroy();

})();
```

### Worker file:
Must inherit from **AbstractWorker**, and implement methos **run()** the method receive the data from the main file, and will also return the result to the main file.
```ts
import { AbstractWorker } from 'node-oop-worker-pool';

export default class ComputeService extends AbstractWorker {

    static path = __filename;

    async run(data: any): Promise<any> {
        console.log("start " + data + " - ", data);
        for (let i = 0; i < 9999999999; i++);
        return "done" + data;
    }

}
```


##  Public method

- setTotalAviableWorkers() - Change number of aviable workers.

- destroy() - Terminate all workers, force end of all tasks and empty the queue.

- chunkArray() - Allows you to split array to chunks, in order to handle large array using workers.


##  License

[MIT](https://choosealicense.com/licenses/mit/)