/// <reference types="vite/client" />
//
declare module "*?sharedworker&name=userSharedWorker" {
  const w: new () => SharedWorker;
  export default w;
}

declare module "*?sharedworker&name=contextLibrarySharedWorker" {
  const w: new () => SharedWorker;
  export default w;
}
