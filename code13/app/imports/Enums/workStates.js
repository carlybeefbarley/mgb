import _ from 'lodash'

export const workStates = ['unknown', 'broken', 'working', 'polished']

export const makeWorkstateNamesArray = hideWorkstateMask =>
  // Special case 0 which is the most common case to be the least work
  hideWorkstateMask === 0 ? workStates : _.filter(workStates, (n, idx) => !((1 << idx) & hideWorkstateMask))

export const defaultWorkStateName = 'unknown'
export const bestWorkStateName = _.last(workStates)

export const workStateIcons = {
  unknown: 'asterisk',
  broken: 'frown',
  working: 'meh',
  polished: 'smile',
}

export const workStateColors = {
  unknown: 'grey',
  broken: 'yellow',
  working: 'olive',
  polished: 'green',
}

// Statuses are for assignments, which are additional labels to workstates
// These will just correspond the 'broken, working, polished' scale respectively

export const assignmentStatuses = {
  unknown: 'unknown',
  broken: 'needs review',
  working: 'needs work',
  polished: 'completed',
}

export const statusIcons = {
  unknown: 'asterisk',
  'needs review': 'exclamation',
  'needs work': 'exclamation',
  completed: 'check',
}
