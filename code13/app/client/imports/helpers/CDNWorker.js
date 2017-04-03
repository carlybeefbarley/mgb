import { makeCDNLink } from './assetFetchers.js'
// export default getCDNWorker = ... makes global variable
const getCDNWorker = (src) => {
  //return new Worker(src)

  const w = new Worker('/lib/workers/workerLoader.js')
  w.postMessage([makeCDNLink(src)])
  return w
}
export default getCDNWorker
