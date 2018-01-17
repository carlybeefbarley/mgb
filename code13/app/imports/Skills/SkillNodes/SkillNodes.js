import _ from 'lodash'
import SpecialGlobals from '/imports/SpecialGlobals'

import C from './CommonSkillNodes'
import ArtSkillNodes from './ArtSkillNodes'
import CodeSkillNodes from './CodeSkillNodes'
import AudioSkillNodes from './AudioSkillNodes'
import LegalSkillNodes from './LegalSkillNodes'
import DesignSkillNodes from './DesignSkillNodes'
import WritingSkillNodes from './WritingSkillNodes'
import BusinessSkillNodes from './BusinessSkillNodes'
import AnalyticsSkillNodes from './AnalyticsSkillNodes'
import CommunitySkillNodes from './CommunitySkillNodes'
import MarketingSkillNodes from './MarketingSkillNodes'
import GetStartedSkillNodes from './GetStartedSkillNodes'

import { getSkillNodeStatus } from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// A) THE SKILLS MODEL TRIFECTA... OVERVIEW
//            ---> skills + tutorials + help <---
//
// In MGBv2, there is a UNIFIED data model for enumerating three related subsystems
//   1) skills        -- The skills that a user has (or claims to have)
//   2) tutorials     -- Our tutorials that support a user's learning in some area
//   3) dynamic help  -- Systems like 'Code Mentor' in EditCode that provide context-sensitive help
//
// ..in order to support this, there is INTENTIONAL AND MANDATORY correlation between
// the namespace/keys of three seemingly separate data structures in MGBv2:
//
//   1a) skills.js     -- This supports the persistence of skills information to the Meteor/MongoDB.
//                        ...Example key:   code/js/lang/basics/types/string (Note the / chars).
//                        To convert dottedKeys to slashSeparated keys, use
//                    >>    import { makeSlashSeparatedSkillKey } from '/imports/Skills/SkillNodes/SkillNodes'
//
//   1b) SkillNodes.js -- This (and the parts it combines from *SkillNodes.js) define the total 'learniverse'
//                        of all skills we understand and track in MGB
//                        ...Example key: code.js.lang.basics.types.string
//                        To check that some string (either a dotted path or a slashSeparatedPath) is a valid
//                        *LEAF* skill (leaf skills are explained below), use
//                    >>    import { isSkillKeyValid } from '/imports/Skills/SkillNodes/SkillNodes'
//
//   1c) SkillAreas.js -- This defines the overall skillAreas (the top-level keys of SkillNodes.js)
//                        and defines the skills that are listed and displayed in LearnSkillsAreaRoute.js and
//                        LearnSkillsRoute.js
// --
//   2a) tutorials     -- This supports tutorials explaining the skill to the user. Note that tutorials are
//        (MGB assets)    stored in JSON files as **MGB Game Assets** of kind 'tutorial' in the !vault account:
//                        ...Example key (MGB Asset Name): !vault:tutorials.code.js.lang.basics.types.string.00
//                           (The .00 suffix is there to support having multi-part tutorials for a given asset)
//                        To generate a tutorial path from a skills path, use
//                    >>    import { makeTutorialAssetPathFromSkillPath } from '/imports/Skills/SkillNodes/SkillNodes'
//
//   2b) SpecialGlobals.js   -- The '!vault:tutorials.' prefix is defined in /imports/SpecialGlobals.js to
//                              preserve my ADHD/OCD-sanity
// --
//   3a) TokenDescription.js -- This is the help for Editing Javascript Code
//                              This has a different (flat, token-based) key hierarchy, but maps back to skillNodes
//                              via the 'help' object that is used in that sourcefile
//                              ..Example:  help['string'].skillNodes = 'code.js.lang.basics.types.string'
//
//   3b) (TBD MORE)          -- There will probably similar things in future for other areas where we can
//                              automate help - for example Toolbars.js

// B) MANDATORY CONSTRAINTS FOR THESE DATA MODELS
//
// The top level names in SkillsNode.js (and it's partial imports from the *SkillNodes.js files')
// (code, art, audio etc) and in fact the full paths MUST correlate with the tag of skillAreaItems
//  as defined in SkillAreas.js
//
// B0) For easy grepping, any files that have to be aware of these constriants must include the comment
// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// B1) CRITICAL: Casually re-arranging the skillNodes hierarchy is a NO-NO because the skills
//     are persisted in MongoDB in the Skills table.
//     Moving/Deleting any skill in SkillNodes will require a matching change
//     in ALL users' Skills table entries to represent the move (and then also
//     of course the other source code files mentioned in 1a/1b/2a/3a above)
//
// B2) The keys for skills, tutorials, and help MUST have the same paths
//     (though note that the separators unfortunately have to differ because of
//      constraints in stores and libraries in order to support a dottedNested
//      syntax for nested objects. But this is ok, as long as we are CAREFUL)
//
// B3), Property/Field keys MUST NOT contain any of the following characters:
//  NO   .      - because we (and lodash and MongoDB) use these as a separator
//                for nesting fields for some syntaxes (eg. _.get() etc)
//  NO   /      - because we convert any dottedPaths we use in memory to slash-separated
//                paths when storing in MongoDB/Meteor
//  NO   ,      - because we use , as a separator when specifying multiple fields
//                sometimes (for example $meta.sequence)
//
//  YES  -      - if you really need a separator within a fieldname, the recommendation
//                is the minus (-) character, but camelCasingIsPreferredInstead. KTHXBYE.

// C) Expected future work on this model
//
// C1)  [ TODO(@dgolds/@stauzs): Implement a check the constraints described in B at runtime
//      or as a unit test, so we don't have a bad day when we mess up a constraint by accident. ]
//
// C2)  [ TODO(@dgolds): Implement multi-part tutorials for a skill area (as enabled in the
//        makeTutorialAssetPathFromSkillPath() helper function )]
//
// C3)  [ TODO(@dgolds): Connect Toolbar.js into this model )]
//
// C4)  [ TODO(@dgolds): Connect KeyBindings.js into this model )]

const SkillNodes = {
  // NOTE THAT EACH OF THESE MUST HAVE A MATCHING ITEM IN SkillAreas.js if it is part of the
  // general skills courses. There are some specific exceptions that have their own top-level UI
  // and they are indicated below in a comment:
  getStarted: GetStartedSkillNodes, // Has specific client UI in LearnGetStartedRoute.js so NOT in skillsAreas.js
  code: CodeSkillNodes,
  //math
  //physics
  //computerScience
  art: ArtSkillNodes,
  design: DesignSkillNodes,
  audio: AudioSkillNodes,
  analytics: AnalyticsSkillNodes,
  writing: WritingSkillNodes,
  marketing: MarketingSkillNodes,
  community: CommunitySkillNodes,
  legal: LegalSkillNodes,
  business: BusinessSkillNodes,

  $meta: {
    map: {},
  },
}

// injection test example
// SkillNodes["code.js.basics.xxx"] = C.E
// SkillNodes["code.js.basics.group"] = {
//   a: C.E,
//   b: C.E,
//   c: C.D
// }

const normalizeKey = (location, key) => {
  if (!key) return []

  const keys = key.split(',')
  return keys.map(key => {
    if (key.substring(0, 1) != '.') return key

    const ka = location.split('.')
    const ra = key.split('.')
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] == '') {
        ka.pop()
        ra.shift()
        i--
      } else break
    }
    return ka.join('.') + '.' + ra.join('.')
  })
}
// convert keys with . to tree structure
const fixKeys = nodes => {
  for (let i in nodes) {
    if (i.indexOf('.') > -1) {
      const parts = i.split('.')
      const oldi = i

      let n = nodes
      let key = parts.pop()
      parts.forEach(p => {
        if (!n[p]) n[p] = {}
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
    if (i == '$meta') continue

    let node = nodes[i]
    const nextKey = key ? key + '.' + i : i

    if (!node) {
      console.error('FAILED to locate node:', key, '[' + nextKey + ']')
      continue
    }

    if (!node.$meta) node.$meta = {}

    node.$meta.key = nextKey
    SkillNodes.$meta.map[nextKey] = node

    node.$meta.requires = normalizeKey(nextKey, node.$meta.requires)
    node.$meta.unlocks = normalizeKey(nextKey, node.$meta.unlocks)

    if (!nodes.$meta.isLeaf) buildMap(node, nextKey)
  }
}

const resolveUnlocksAndRequires = () => {
  const map = SkillNodes.$meta.map
  for (let i in map) {
    if (map[i].$meta.requires) {
      map[i].$meta.requires.forEach(k => {
        if (!map[k]) console.error(`Cannot resolve 'require' for ${i}:`, k)
        else map[k].$meta.unlocks.push(i)
      })
    }
    if (map[i].$meta.unlocks) {
      map[i].$meta.unlocks.forEach(k => {
        if (!map[k]) console.error(`Cannot resolve 'require' for ${i}:`, k)
        else map[k].$meta.requires.push(i)
      })
    }
  }
}

buildMap(SkillNodes)
resolveUnlocksAndRequires()

export default SkillNodes

/**
 * Count (fixed) max-available totals achieved Skills.
 * Note that there is a handy pre-computed export maxSkillsCount for all skills
 * The counterpart for a User's number of actual achieved Skills is countCurrentUserSkills() in skills.js
 *
 * @export
 * @param {string} [dotttedSkillPrefix=null] Optional prefix in dotted form.. e.g. getStarted.
 * @returns {Number}
 */
export function countMaxUserSkills(dotttedSkillPrefix = null) {
  let count = 0
  _.each(SkillNodes.$meta.map, (node, sk) => {
    if (
      node.$meta &&
      node.$meta.isLeaf === 1 &&
      (dotttedSkillPrefix === null || sk.startsWith(dotttedSkillPrefix))
    )
      count++
  })
  return count
}

export const maxSkillsCount = countMaxUserSkills()

// MongoDB field names can't have dots in. See https://docs.mongodb.com/manual/core/document/#field-names
export const makeSlashSeparatedSkillKey = dottedSkillKey => dottedSkillKey.replace(/\./g, '/')
export const makeDottedSkillKey = slashSeparatedSkillKey =>
  slashSeparatedSkillKey ? slashSeparatedSkillKey.replace(/\//g, '.') : null

export const isSkillKeyValid = skillPath => {
  const dottedSkillKey = makeDottedSkillKey(skillPath)
  const node = _.get(SkillNodes, dottedSkillKey)
  return node && node.$meta && node.$meta.isLeaf === 1
}

// Note that this can return null for an invalid path request, in which case it will also console.error()
//   skillPath can be either a slashSeparated or dottedPath.
//   skillPath MUST be to a LEAF skill (ie.. not a container of skills)
//   partNumber must be integer from 0..99 inclusive. Default value is 0 if not provided.

export const makeTutorialAssetPathFromSkillPath = (skillPath, partNumber = 0) => {
  if (!Number.isInteger(partNumber) || partNumber < 0 || partNumber > 99) {
    console.error(
      `makeTutorialAssetPathFromSkillPath(${skillPath}, ${partNumber}) error: partNumber=${partNumber} is not valid, must be integer from 0 to 99.`,
    )
    return null
  }

  if (partNumber > 0) {
    // This is part of the namespace design for the SKILLS_MODEL_TRIFECTA, but isn't actually used yet.
    // Let's make sure it doesn't get called and used by mistake before we are ready.
    throw new Error(
      `PREMATURE! makeTutorialAssetPathFromSkillPath(${skillPath}, ${partNumber}) is not expecting a partNumber > 0 YET. Are you from the future?`,
    )
  }

  if (!isSkillKeyValid(skillPath)) {
    console.error(
      `makeTutorialAssetPathFromSkillPath(${skillPath}) error: isSkillKeyValid() failed validation`,
    )
    return null
  }

  const dottedSkillKey = makeDottedSkillKey(skillPath)
  const partNumberPaddedStr = ('00' + partNumber).slice(-2)
  const retVal = `${SpecialGlobals.skillsModelTrifecta.tutorialAccount}:${SpecialGlobals.skillsModelTrifecta
    .tutorialAssetNamePrefix}${dottedSkillKey}.${partNumberPaddedStr}`
  console.log(`makeTutorialAssetPathFromSkillPath(${skillPath}, ${partNumber}) => '${retVal}'`)

  return retVal
}

export const makeTutorialsFindSelector = dottedSkillKey => {
  if (!dottedSkillKey) return null

  const fullKeyPrefix = SpecialGlobals.skillsModelTrifecta.tutorialAssetNamePrefix + dottedSkillKey
  // replace . with \.
  const escapedKey = fullKeyPrefix.replace(/\./g, '\\.')
  const regexToBuild = `^${escapedKey}\\.[0-9][0-9]$`
  const reg = new RegExp(regexToBuild, 'i')
  return {
    kind: 'tutorial',
    name: { $regex: reg },
    isDeleted: false,
    dn_ownerName: SpecialGlobals.skillsModelTrifecta.tutorialAccount,
  }
}

export const getNode = skillPath => Object.freeze({ ...SkillNodes.$meta.map[skillPath] })
export const getPath = skillNode => skillNode.$meta.key

export const getParentPath = skillPath => _.initial(skillPath.split('.')).join('.')

export const isRootPath = skillPath => !_.includes(skillPath, '.') && !!getNode(skillPath)
export const isLeafPath = skillPath => !!getNode(skillPath).$meta.isLeaf
export const isLeafNode = skillPath => !isRootPath(skillPath)

export const getChildPaths = skillPath => {
  return Object.keys(getNode(skillPath))
    .filter(key => !_.startsWith(key, '$'))
    .map(key => [skillPath, key].join('.'))
}

export const getParentNode = skillPath => getNode(getParentPath(skillPath))
export const getChildNodes = skillPath => getChildPaths(skillPath).map(getNode)

export const getFriendlyName = skillPath => {
  return _.get(getNode(skillPath), '$meta.name') || _.startCase(_.last(skillPath.split('.')))
}

export const getFriendlyNames = skillPath => {
  const names = []

  if (!skillPath) return names

  do {
    names.unshift(getFriendlyName(skillPath))
    skillPath = skillPath.substring(0, skillPath.lastIndexOf('.'))
  } while (skillPath)

  return names
}

// this string indicates if a path is code challenge
const _challengeStrArray = ['basics', 'intro', 'advanced']

export const isStringChallenge = str => _.includes(_challengeStrArray, str)

export const isPathChallenge = skillPath =>
  _.some(_challengeStrArray, str => _.startsWith(skillPath, 'code.js.' + str))

export const isPathCodeTutorial = skillPath =>
  _.startsWith(skillPath, 'code.js.games') || _.startsWith(skillPath, 'code.js.phaser')

export const isPhaserTutorial = skillPath => _.startsWith(skillPath, 'code.js.phaser')

export const isArtTutorial = skillPath => _.startsWith(skillPath, 'art')

// order in which skillNodes should be completed
// this is needed for dashboard "next skill" functionality
export const SkillNodesOrder = {
  getStarted: SkillNodes.getStarted,
  code: {
    js: {
      intro: SkillNodes.code.js.intro,
      phaser: SkillNodes.code.js.intro,
      games: SkillNodes.code.js.games,
      advanced: SkillNodes.code.js.intro,
    },
  },
  art: SkillNodes.art,
}

// Ordered lists of learn items and corresponding info
export const artItems = [
  { key: 'lineArt', node: SkillNodes.art.lineArt, mascot: 'arcade_player' },
  { key: 'colors', node: SkillNodes.art.colors, mascot: 'rpgGuy' },
  { key: 'shadesAndTextures', node: SkillNodes.art.shadesAndTextures, mascot: 'slimy2' },
  { key: 'gameSprites', node: SkillNodes.art.gameSprites, mascot: 'game_runner' },
]

export const codeItems = [
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Intro to Coding',
    link: '/learn/code/intro',
    skillPath: 'code.js.intro',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Learn the basics of the Javascript programming language.
    This covers the core programming language concepts necessary to write a game: variables, arrays, loops, functions, etc.
    If you already know these, you can proceed to the next section instead...`,
  },
  {
    mascot: 'phaserLogo',
    icon: 'code',
    content: 'Game Development Concepts',
    link: '/learn/code/phaser',
    skillPath: 'code.js.phaser',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Phaser is a popular game engine written in JavaScript. Learn to handle graphics, sound, maps, physics, and more.`,
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Make Games',
    link: '/learn/code/games',
    skillPath: 'code.js.games',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `These walkthroughs will show you how to create a game using your new Phaser game-dev skills.`,
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify Games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `We provide some working games that you can fork (copy) and change as you wish.`,
  },
  {
    mascot: 'javascript-logo',
    icon: 'code',
    content: 'Advanced Coding',
    link: '/learn/code/advanced',
    skillPath: 'code.js.advanced',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: [
      'Learn the advanced part of Javascript.',
      "This covers concepts you don't necessarily need to develop a basic game.",
      'But it is always good to build your developer expertise.',
    ].join(' '),
  },
]

export const getStartedItems = [
  { node: SkillNodes.getStarted.profile, mascot: 'arcade_player' },
  { node: SkillNodes.getStarted.chat, mascot: 'slimy2' },
  { node: SkillNodes.getStarted.play, mascot: 'whale' },
  { node: SkillNodes.getStarted.assetsBasics, mascot: 'ideaguy' },
  { node: SkillNodes.getStarted.projects, mascot: 'team' },
  { node: SkillNodes.getStarted.nonCodeGame, mascot: 'duck' },
  //  { node: SkillNodes.getStarted.codeGame, mascot: 'bigguy' }
  // { node: SkillNodes.getStarted.assetsAdvanced,  mascot: 'ideaguy'      },
  // { node: SkillNodes.getStarted.learn,           mascot: 'MgbLogo'      }
]

function _convertToDottedSkills(obj) {
  const arr = []
  if (!_.isObject(obj)) return null
  _.forOwn(obj, (val, key) => {
    if (key !== '$meta') {
      const children = _convertToDottedSkills(val)
      if (!_.isArray(children) || _.isEmpty(children)) arr.push(key)
      else {
        children.forEach(childVal => {
          let str = key
          str += '.' + childVal
          arr.push(str)
        })
      }
    }
  })
  return arr
}

function _getParentDottedSkills(arr) {
  const newArr = []
  arr.forEach(val => {
    val = val.split('.')
    val.pop()
    val = val.join('.')
    newArr.push(val)
  })
  return newArr
}

export const getNextSkillPath = (currUser, userSkills) => {
  const dottedSkillArr = _convertToDottedSkills(SkillNodesOrder)
  const parentSkillArr = _getParentDottedSkills(dottedSkillArr)
  for (let i = 0; i < parentSkillArr.length; i++) {
    const skillPath = parentSkillArr[i]
    const skillStatus = getSkillNodeStatus(currUser, userSkills, skillPath)
    if (!_.isEmpty(skillStatus.todoSkills)) {
      const nextSkillPath = skillPath + '.' + skillStatus.todoSkills[0]
      return nextSkillPath
      // this.setState({ nextSkillPath })
      // const skillNode = getNode(nextSkillPath)
      // // some skills doesn't have name
      // const name = skillNode.$meta.name ? skillNode.$meta.name : nextSkillPath
      // this.setState({ nextSkillName: name })
      // break
    }
  }
}
