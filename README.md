
  
#  node-oop-worker-pool

node-oop-worker-pool is a NodeJS library for dealing with multi threaded programing in a OOP approach.

##  Installation

Use the package manager [npm](https://www.npmjs.com/package/node-oop-worker-pool) to install splunk-logger.

```bash

npm install node-oop-worker-pool

```

##  Usage
### Main file:

Use WorkersPool.Task() start tasl in a new thread, if there are more tasks then aviable workers it will wait in the quque.

Example:
```ts
import  ComputeService  from  "./computeService";
import  WorkersPool  from  "node-oop-worker-pool";


(async () => {

	const  promises = [];
	for (const  data  of  Array.from(Array(100).keys())) {
		const  task = WorkersPool.Task(data, ComputeService.path);
		promises.push(task);
	}

	await  Promise.all(promises);
	WorkersPool.destroy();

})();

```

### Worker file:
Must inherit from **AbstractWorker**, and implement methos **run()** the method receive the data from the main file, and will also return the result to the main file.
```ts
import { AbstractWorker } from  'node-oop-worker-pool';

  
export  default  class  ComputeService  extends  AbstractWorker {

	static  path = __filename;

	async  run(data: any): Promise<any> {
		console.log("start " + data + " - ", data);
		for (let  i = 0; i < 9999999999; i++);
		return  "done" + data;

	}
}
```


##  Public method

- stop() - Finsh all active tasks and then empty the queue.

- destroy() - Terminate all workers, force end of all tasks and empty the queue.


##  License

[MIT](https://choosealicense.com/licenses/mit/)