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
  'mole2': {
    $meta: {
      name: 'Whack a Mole Part 2',
      icon: 'code',
      description: `Second game from series`,
    },
    'mole2': C.En(0)
  },  
  'mole3': {
    $meta: {
      name: 'Whack a Mole Part 3',
      icon: 'code',
      description: `Third game from series`,
    },
    'mole3': C.En(0)
  }, 
  'mole4': {
    $meta: {
      name: 'Whack a Mole Part 4',
      icon: 'code',
      description: `Fourth game from series`,
    },
    'mole4': C.En(0)
  },  
  'digger': {
    $meta: {
      name: 'Digger',
      icon: 'code',
      description: `Mining and collecting resources`,
    },
    'digger': C.En(0)
  }
}