import { E, D } from './Common.js'
import CodeSkillNodes from './CodeSkillNodes.js'

// TODO(@dgolds) -
const SkillNodes = {
  code: CodeSkillNodes,
  art: {
    concept: E,
    animations: E
  },
  design: {},
  audio: {
    ambient: E,
    fx: D
  },
  community: {},
  analytics: {},
  marketing: {},
  business: {}
}

export default SkillNodes
