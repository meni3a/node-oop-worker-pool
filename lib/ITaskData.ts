export interface ITaskData {
    fileName: string,
    data: any,
    resolve: ((value?: any | PromiseLike<any>) => void),
    reject: (reason?: any) => void
}
