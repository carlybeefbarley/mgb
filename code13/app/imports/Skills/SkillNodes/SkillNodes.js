import C from './CommonSkillNodes.js'
import CodeSkillNodes from './CodeSkillNodes.js'

// Note that the top level names here (code, art, audio etc) must correlate with the tag
// of skillAreaItems as defined in SkillAreas.js

const SkillNodes = {
  code:             CodeSkillNodes,
 
  art: {
    proportion:     C.E,
    process: {
      'concept':        C.E,
      'constraints':    C.E,
      'sketch':         C.E,
      'review':         C.E,
      'coloring':       C.E
    },
    shading: {
      'pillow shading':   C.E,
      'dithering':        C.E,
      'anti-aliasing':    C.E,
      'reverse aa':       C.E,
      'lines-and-curves': C.E,
      'ambient lighting': C.E,
      'transparency':     C.E,
      'interlaces-scanlines': C.E,
      'layers':           C.E
    },
    perspectives: {
      'top-down':     C.E,
      'side-view':    C.E,
      isometric:      C.E
      // @stanchion.. others?
    },
    'character-design': {
      humanoids:		C.E,
      animals:	  	C.E,
      monsters:     C.E,
      objects:			C.E	// i.e. cookies, burgers, etc
    },
    color: 
    { 
      'palettes':    C.E,
      'color-temp':  C.E,
    },
    animations:      C.E
  },

  design: {
    'gameplay': {
      'is it fun':          C.E,
      'is it interesting':  C.E,
      'is it challenging':  C.E,
      'is it social':       C.E
      // @stanchion.. more here pls?
      //

    },
    
    'the meta': {
      'metagame':         C.E,
      'win bonusses':     C.E,
      'loss penalties':   C.E,
      'ELO':              C.E,
      'ranking':          C.E,
      'matchmaking':      C.E
    },
    
    'game-mechanics': {
      'final-objectives': {
        'win conditions':    C.E,
        'infinite-play':     C.E,
        'game loss':         C.E
      },
      
      
      health:	{
        'initial health':    C.E,
        'max health':        C.E,
        'recovery rates':    C.E,
        'healing':           C.E,
        'max-health boost':  C.E,
        'extra lives':       C.E
      },
        
      combat: {
        'melee':		    C.E,
        'touch-damage': C.E,
        'shots':        C.E,
        'direct-damage':   C.E,
        'splash-damage':   C.E,
        'reflected-damage': C.E
      },
        
      defense: {
        'armor':           C.E,
        'agility':         C.E,
        'stealth':         C.E,
        'invulnerability': C.E 
      },
      
      modifiers: {
        buffs:             C.E,
        debuffs:           C.E
      },
       
      puzzles: { 
        sokoban:           C.E,
        'required-item':   C.E
        // @stanchion.. more here pls
      },
        
      'in-game-rewards': {
        loot:           C.E
        // @stanchion.. more here pls
        
      }
    },
      
    'level design': {
      'pathing':      C.E,
      'oclusion':     C.E,
      'backtrack':    C.E,
      'secrets':      C.E,
      'bottlenecks':  C.E
        // @stanchion.. more here pls.. what about 'big rooms' ? 
      
    },
      
    pacing: {
      'progression':  C.E,
      'grinding':     C.E,
      'bosses':       C.E
      // @stanchion.. others?        
    }
  },

  audio: {
    music: {
      ambient:        C.E,
      intense:        C.E,
      loops:          C.E
    },
    fx: {
      jsfxr:          C.E,
      loops:          C.E
    } 
  },

  community: {
    betas:            C.E,
    feedback:         C.E,
    support:          C.E,
    issues:           C.E,
    trolls:           C.E,
    playtesting:      C.E
  },

  writing: {
    character: {
      roles: { 
        protagonist:   C.E,
        antagonist:    C.E,
      },
      relationships: {
        mentor:        C.E        
        // more
      },
      motivations: { 
        survival:  C.E,
      }
    },
    structures: {
      "Hero's Journey": C.E
    },
    'narrative devices':   C.E,
    "Narrator":       C.E,
    
  },
  
  analytics: {
    metrics:          C.E,
    bouncerate:       C.E,
    engagement:       C.E,
    conversion:       C.E
  },

  marketing: {
    customer:         C.E,
    requirements:     C.E,
    competitors:      C.E,
    reach:            C.E,
    growth:           C.E
  },

  business: {
    monetization:     C.E,
    freemium:         C.E,
    upsell:           C.E,
    consumables:      C.E,
    subscriptions:    C.E,
    ads:              C.E
  },

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