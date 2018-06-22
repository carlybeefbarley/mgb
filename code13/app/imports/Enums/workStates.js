import _ from 'lodash'

export const workStates = ['broken', 'unknown', 'working', 'polished']

export const makeWorkstateNamesArray = hideWorkstateMask =>
  // Special case 0 which is the most common case to be the least work
  hideWorkstateMask === 0 ? workStates : _.filter(workStates, (n, idx) => !((1 << idx) & hideWorkstateMask))

export const defaultWorkStateName = 'unknown'
export const bestWorkStateName = _.last(workStates)

export const workStateIcons = {
  broken: 'frown',
  unknown: 'asterisk',
  working: 'meh',
  polished: 'smile',
}

export const assignmentStatuses = ['needs review', 'needs work', 'completed']

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
