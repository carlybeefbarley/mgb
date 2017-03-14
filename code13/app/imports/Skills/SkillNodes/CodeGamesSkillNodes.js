import C from './CommonSkillNodes'

// skillnodes for game tutorials
// skillnodes are connected with /public/codeTutorials.json . Link is a key of node: "mole1", "digger"

export default {
  $meta: {
    name:           'Game tutorials',
    description:    'Use your new game programming knowledge to create a game step by step. The first tutorial shows how to code the minimal \'base\' of game. The next tutorials show how to add features.'
  },
  'mole1': {
    $meta: {
      name: 'Whack a Mole Part 1',
      icon: 'code',
      description: `First game from series`,
      "subsection": "Games",
   },
    'mole1': C.En(0)
  },
  'mole2': {
    $meta: {
      name: 'Whack a Mole Part 2',
      icon: 'code',
      description: `Second game from series`,
      "subsection": "Games",
    },
    'mole2': C.En(0)
  },  
  'mole3': {
    $meta: {
      name: 'Whack a Mole Part 3',
      icon: 'code',
      description: `Third game from series`,
      "subsection": "Games",
    },
    'mole3': C.En(0)
  }, 
  'mole4': {
    $meta: {
      name: 'Whack a Mole Part 4',
      icon: 'code',
      description: `Fourth game from series`,
      "subsection": "Games",
    },
    'mole4': C.En(0)
  },  
  'digger': {
    $meta: {
      name: 'Digger',
      icon: 'code',
      description: `Mining and collecting resources`,
      "subsection": "Games",
    },
    'digger': C.En(0)
  }
}