
// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// Common Skill Node helpers

// list of known / reserved keys:
//   $meta.enabled        - 1 or 0
//   $meta.isLeaf         - tells if node is final in the tree (1 or 0)
//   $meta.$name          - Name
//   $meta.$description   - Description
//   $meta.requires       - requires some other skill block first (string with comma separated paths).. e.g .basics, or ..basics
//   $meta.requireOneOf   - requires just ONE of the other skill block first 
//   $meta.unlock         - unlocks some subsequent skill block

export default {
  make(...a){
    return Object.assign({}, ...a);
  },

  meta(o, ...a) {
    let ret = o
    a.forEach((o) => { ret = Object.assign(ret, o.$meta) })     // Could use _.assign() or _.defaults
    return { $meta: ret }
  },

  // enabled node
  get E() {
    return {
      $meta: {
        enabled: 1,
        isLeaf: 1
      }
    }
  },

  // disabled node
  get D() {
    return {
      $meta: {
        enabled: 0,
        isLeaf: 1
      }
    }
  }
}
