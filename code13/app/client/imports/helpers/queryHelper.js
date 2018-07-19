import _ from 'lodash'
export function queryHelper(search) {
  if (!search) return null

  let data = search
  if (data.length > 0) {
    data = data.slice(1, data.length)
  }
  let queryData = data.split('&')

  _.forEach(queryData, (item, index) => {
    console.log('foreachData:', item, index)
    queryData[index] = item.replace(/(.*)=(.*)/, (match, p1, p2) => {
      console.log('replace regex', p1, p2)
      let param2 = p2

      if (!p2.match(/^[0-9]*$/)) {
        param2 = `"${p2}"`
      }
      console.log('full replace:', `{"${p1}": ${param2}}`)
      return `{"${p1}": ${param2}}`
    })
  })

  console.log('query data', queryData)
  console.log('as JSON', JSON.parse(queryData))

  return JSON.parse(queryData)
}
