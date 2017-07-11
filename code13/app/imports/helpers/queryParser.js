export default str => {
  const query = {}
  const parts = str.split('?')
  if (parts.length === 0)
    return query

  parts.pop().split('&').forEach(val => {
    const cp = val.split('=')
    query[cp[0]] = cp[1]
  })

  return query
}
