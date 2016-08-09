import C from './Common.js'
import CodeSkillNodes from './CodeSkillNodes.js'

// TODO(@dgolds) -
const SkillNodes = {
  code: CodeSkillNodes,
  art: {
    concept: C.E,
    animations: C.E
  },
  design: {},
  audio: {
    ambient: C.E,
    fx: C.D
  },
  community: {},
  analytics: {},
  marketing: {},
  business: {},
  $meta: {
    map: {}
  }
}

// build maps from nodes e.g. from {code: {js: {basics: E}}} create: {"code.js.basics": E}
const normalizeRequire = (key, req) => {
  if(req.substring(0, 1) != "."){
    return req;
  }
  const ka = key.split('.')
  const ra = req.split('.')
  for (let i = 0; i < ra.length; i++) {
    if (ra[i] == '') {
      ka.pop()
      ra.shift()
      i--
    }
    else {
      break
    }
  }
  return ka.join('.') + '.' + ra.join('.')
}

(function buildMap(nodes, key = ''){

  // final node
  for(let i in nodes){
    // skip meta
    if(i == "$meta"){
      continue;
    }
    const node = nodes[i];

    const nextKey = key ? key + '.' + i : i;

    if(!node) {
      console.log("FAILED to locate node:", key);
      continue;
    }
    if(!node.$meta){
      node.$meta = {}
    }

    node.$meta.key = nextKey;
    SkillNodes.$meta.map[nextKey] = node;

    if(node.$meta.requires){
      node.$meta.requires = normalizeRequire(nextKey, node.$meta.requires);
    }

    if(!nodes.$meta.isLeaf){
      buildMap(node, nextKey);
    }
  }

})(SkillNodes)
if(Meteor.isClient){
  window.skills = SkillNodes;
  window.C = C;
}

export default SkillNodes
