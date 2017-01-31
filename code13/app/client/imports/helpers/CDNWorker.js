import { makeCDNLink } from './assetFetchers.js'
export default getCDNWorker = (src) => {
  const w = new Worker('/lib/workers/workerLoader.js')
  w.postMessage([makeCDNLink(src)])
  return w
}
