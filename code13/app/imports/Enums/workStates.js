import _ from 'lodash'

export const workStateNames = ['broken', 'experiment', 'unknown', 'working', 'polished', 'showcase']

export const makeWorkstateNamesArray = hideWorkstateMask =>
  // Special case 0 which is the most common case to be the least work
  hideWorkstateMask === 0
    ? workStateNames
    : _.filter(workStateNames, (n, idx) => !((1 << idx) & hideWorkstateMask))

export const defaultWorkStateName = 'unknown'
export const bestWorkStateName = _.last(workStateNames)

export const workStateIcons = {
  broken: 'bug',
  experiment: 'lab',
  unknown: 'asterisk',
  working: 'meh',
  polished: 'smile',
  showcase: 'thumbs up',
}
