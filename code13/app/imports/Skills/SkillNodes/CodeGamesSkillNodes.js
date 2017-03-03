import C from './CommonSkillNodes'

// skillnodes for game tutorials
// skillnodes are connected with /public/codeTutorials.json . Link is a key of node: "mole1", "digger"

export default {
  $meta: {
    name:           'Game tutorials',
    description:    ''
  },
  'mole1': {
    $meta: {
      name: 'Whack a Mole Part 1',
      icon: 'code',
      description: `First game from series`,
    },
    'mole1': C.En(0)
  },  
  'digger': {
    $meta: {
      name: 'Digger',
      icon: 'code',
      description: `Digger game`,
    },
    'digger': C.En(0)
  }
}