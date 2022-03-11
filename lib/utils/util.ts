export function chunkArray(array:any[], chunk_size:number){
    const results = [];
    while (array.length) {
        results.push(array.splice(0, chunk_size));
    }
    return results;
}