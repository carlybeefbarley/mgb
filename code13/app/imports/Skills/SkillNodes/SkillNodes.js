import C from './CommonSkillNodes.js'
import ArtSkillNodes from './ArtSkillNodes.js'
import CodeSkillNodes from './CodeSkillNodes.js'
import AudioSkillNodes from './AudioSkillNodes.js'
import DesignSkillNodes from './DesignSkillNodes.js'
import WritingSkillNodes from './WritingSkillNodes.js'
import BusinessSkillNodes from './BusinessSkillNodes.js'
import AnalyticsSkillNodes from './AnalyticsSkillNodes.js'
import CommunitySkillNodes from './CommunitySkillNodes.js'
import MarketingSkillNodes from './MarketingSkillNodes.js'
import GetStartedSkillNodes from './GetStartedSkillNodes.js'

// Note that the top level names here (code, art, audio etc) must correlate with the tag
// of skillAreaItems as defined in SkillAreas.js

const SkillNodes = {
  art:        ArtSkillNodes,
  code:       CodeSkillNodes,
  audio:      AudioSkillNodes,
  design:     DesignSkillNodes,
  writing:    WritingSkillNodes,
  business:   BusinessSkillNodes,
  community:  CommunitySkillNodes,
  analytics:  AnalyticsSkillNodes,
  marketing:  MarketingSkillNodes,
  getStarted: GetStartedSkillNodes,

  $meta: {
    map: {}
  }
}
// injection test example
  // SkillNodes["code.js.basics.xxx"] = C.E
  // SkillNodes["code.js.basics.group"] = {
  //   a: C.E,
  //   b: C.E,
  //   c: C.D
  // }

const normalizeKey = (location, key) => {
  if (!key)
    return []

  const keys = key.split(",")
  return keys.map((key) => {
    if (key.substring(0, 1) != ".")
      return key

    const ka = location.split('.')
    const ra = key.split('.')
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] == '') {
        ka.pop()
        ra.shift()
        i--
      }
      else
        break
    }
    return ka.join('.') + '.' + ra.join('.')
  })
}
// convert keys with . to tree structure
const fixKeys = (nodes) => {
  for(let i in nodes){
    if(i.indexOf(".") > -1){
      const parts = i.split(".")
      const oldi = i

      let n = nodes
      let key = parts.pop()
      parts.forEach((p) => {
        if (!n[p])
          n[p] = {}
        n = n[p]
      })
      n[key] = nodes[oldi]
      delete nodes[oldi]
    }
  }
}

// build maps from nodes e.g. from {code: {js: {basics: E}}} create: {"code.js.basics": E}
const buildMap = (nodes, key = '') => {
  fixKeys(nodes)
  // final node
  for (let i in nodes) {
    // skip meta
    if (i == "$meta")
      continue

    let node = nodes[i]
    const nextKey = key ? key + '.' + i : i

    if (!node) {
      console.error("FAILED to locate node:", key, "["+nextKey+"]")
      continue
    }

    if (!node.$meta)
      node.$meta = {}

    node.$meta.key = nextKey
    SkillNodes.$meta.map[nextKey] = node

    node.$meta.requires = normalizeKey(nextKey, node.$meta.requires)
    node.$meta.unlocks = normalizeKey(nextKey, node.$meta.unlocks)

    if (!nodes.$meta.isLeaf)
      buildMap(node, nextKey)
  }
}

const resolveUnlocksAndRequires = () => {
  const map = SkillNodes.$meta.map
  for (let i in map) {
    if (map[i].$meta.requires) {
      map[i].$meta.requires.forEach((k) => {
        if (!map[k])
          console.error(`Cannot resolve 'require' for ${i}:`, k)
        else
          map[k].$meta.unlocks.push(i)
      })
    }
    if (map[i].$meta.unlocks) {
      map[i].$meta.unlocks.forEach((k) => {
        if (!map[k])
          console.error(`Cannot resolve 'require' for ${i}:`, k)
        else
          map[k].$meta.requires.push(i)
      })
    }
  }
}

buildMap(SkillNodes)
resolveUnlocksAndRequires()
export default SkillNodes