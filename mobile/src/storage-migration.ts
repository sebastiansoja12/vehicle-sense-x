type KeyValue={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem:(key:string)=>Promise<void>};
/** Remove the legacy copy only after a validated record is safely stored in SQLite. */
export function createMigratingStorage(current:KeyValue,legacy:KeyValue,validate:(key:string,value:string)=>void):KeyValue{return{
 async getItem(key){const value=await current.getItem(key);if(value!==null){try{await legacy.removeItem(key);}catch{/* Retry legacy cleanup on the next read. */}return value;}const previous=await legacy.getItem(key);if(previous===null)return null;validate(key,previous);await current.setItem(key,previous);try{await legacy.removeItem(key);}catch{/* The authoritative copy is already durable. */}return previous;},
 setItem:(key,value)=>current.setItem(key,value),
 async removeItem(key){await legacy.removeItem(key);await current.removeItem(key);}
};}
