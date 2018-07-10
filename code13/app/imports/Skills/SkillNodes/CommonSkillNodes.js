// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// Common Skill Node helpers

// list of known / reserved keys:
//   $meta.enabled        - 1 or 0
//   $meta.level          - a learning level as an integer (for now, in range 0...4)
//                            0 = absolute beginner (e.g. var)
//                            1 = beginner: still very new to this stuff, but to complete core functionality)
//                            2 = junior: unusual/avoidable, but useful for intermediate devs (e.g class)
//                            3 = advanced: useful but not esoteric (e.g spread operator)
//                            4 = guru: esoteric, the stuff that is very new, or a bad idea, or just very rarely needed
//   $meta.isLeaf         - tells if node is final in the tree (1 or 0)
//   $meta.$name          - Name
//   $meta.$description   - Description
//   $meta.requires       - requires some other skill block first (string with comma separated paths).. e.g .basics, or ..basics
//   $meta.requireOneOf   - requires just ONE of the other skill block first
//   $meta.unlock         - unlocks some subsequent skill block

import _ from 'lodash'
const _validateLevel = level => {
  if (level < 0 || level > 4 || !Number.isInteger(level)) {
    throw new Error('@dgolds 12/14/16 debugger: Unexpected SkillNode Level ' + level)
  }
}

const CommonSkillNodes = {
  make(...a) {
    return Object.assign({}, ...a)
  },

  meta(o, ...a) {
    let ret = o
    a.forEach(o => {
      ret = Object.assign(ret, o.$meta)
    }) // Could use _.assign() or _.defaults
    return { $meta: ret }
  },

  // enabled node. It's preferred to use En(0)'
  get E() {
    return {
      $meta: {
        enabled: 1,
        level: 0, // By default
        isLeaf: 1,
      },
    }
  },

  En(level = 0, name) {
    // Note that 0 will be turned into 1.. the levels go from 1 to 4
    _validateLevel(level)
    const retval = {
      $meta: {
        enabled: 1,
        level,
        isLeaf: 1,
      },
    }
    if (_.isString(name)) retval.$meta.name = name
    return retval
  },

  // disabled node
  get D() {
    return {
      $meta: {
        enabled: 0,
        level: 0,
        isLeaf: 1,
      },
    }
  },
}

export default CommonSkillNodes
