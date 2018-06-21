import _ from 'lodash'

export const workStateQualities = ['broken', 'unknown', 'working', 'polished']
export const workStateStatuses = ['needs review', 'needs work', 'completed']

export const makeWorkstateNamesArray = hideWorkstateMask =>
  // Special case 0 which is the most common case to be the least work
  hideWorkstateMask === 0
    ? workStateQualities
    : _.filter(workStateQualities, (n, idx) => !((1 << idx) & hideWorkstateMask))

export const defaultWorkStateName = 'unknown'
export const bestWorkStateQuality = _.last(workStateQualities)

export const qualityIcons = {
  broken: 'frown',
  unknown: 'asterisk',
  working: 'meh',
  polished: 'smile',
}

export const statusIcons = {
  unknown: 'asterisk',
  'needs review': 'exclamation',
  'needs work': 'exclamation',
  completed: 'check',
}

export const statusColors = {
  unknown: 'grey',
  'needs review': 'yellow',
  'needs work': 'olive',
  completed: 'green',
}
