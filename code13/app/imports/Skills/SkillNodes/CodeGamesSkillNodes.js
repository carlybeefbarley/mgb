import C from './CommonSkillNodes'

// skillnodes for game tutorials
// skillnodes are connected with /public/codeTutorials.json . Link is a key of node: "mole1", "digger"

export default {
  $meta: {
    name:           'Game tutorials',
    description:    'These walkthoughs will show you how to create a game using your new PhaserJS game-dev skills. For each game there is a first tutorial that shows how to code the minimal \'base\' of a game. Subsequent tutorials then add more features to that base.'
  },
  'mole1': {
    $meta: {
      name: 'Whack a Mole 1: Base',
      icon: 'code',
      description: `First game from series`,
      "subsection": "Whack-a-Mole",
    },
    'mole1': C.En(0)
  },
  'mole2': {
    $meta: {
      name: 'Whack a Mole 2: Animations',
      icon: 'code',
      description: `Second game from series`,
      "subsection": "Whack-a-Mole",
    },
    'mole2': C.En(0)
  },  
  'mole3': {
    $meta: {
      name: 'Whack a Mole 3: Speedup',
      icon: 'code',
      description: `Third game from series`,
      "subsection": "Whack-a-Mole",
    },
    'mole3': C.En(0)
  }, 
  'mole4': {
    $meta: {
      name: 'Whack a Mole 4: Menus',
      icon: 'code',
      description: `Fourth game from series`,
      "subsection": "Whack-a-Mole",
    },
    'mole4': C.En(0)
  },  
  'digger': {
    $meta: {
      name: 'Digger',
      icon: 'code',
      description: `Mining and collecting resources`,
      "subsection": "Digger",
    },
    'digger': C.En(0)
  }
}