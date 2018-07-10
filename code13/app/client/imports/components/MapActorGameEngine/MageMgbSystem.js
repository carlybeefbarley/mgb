import _ from 'lodash'
// Constants/functions related to the overall MGB MapActor Game Engine

const MgbSystem = {
  tileMinWidth: 32,
  tileMinHeight: 32,
  tileMaxWidth: 128,
  tileMaxHeight: 128,

  gameFonts: [
    'titlefont',
    'abscissa',
    'bradybunch',
    'geosanslight',
    'argorpriht',
    'ellianarellespath',
    'illegaledding',
  ],

  parseEventCommand(str) {
    const [cmd, params] = str.split(': ')
    const p2 = params.split(',').sort()
    let result = { command: cmd }
    _.each(p2, p => {
      const [k, v] = p.trim().split('=')
      result[k] = v
    })
    return result
  },
}

export default MgbSystem
