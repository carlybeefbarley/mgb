import C from './CommonSkillNodes'

// skillnodes for game tutorials
// skillnodes are connected with /public/codeTutorials.json . Link is a key of node: "mole1", "digger"

const CodeGameSkillNodes = {
  $meta: {
    name: 'Make Games',
    description:
      "These walkthroughs will show you how to create a game using your new Phaser game-dev skills. For each game there is a first tutorial that shows how to code the minimal 'base' of a game. Subsequent tutorials then add more features to that base.",
  },
  mole1: {
    $meta: {
      name: 'Whack a Mole 1: Base',
      icon: 'code',
      description: `First game from series`,
      subsection: 'Whack-a-Mole',
      skillChallengeType: 'games',
      ...C.E.$meta,
    },
  },
  mole2: {
    $meta: {
      name: 'Whack a Mole 2: Animations',
      icon: 'code',
      description: `Second game from series`,
      subsection: 'Whack-a-Mole',
      skillChallengeType: 'games',
      ...C.E.$meta,
    },
  },
  mole3: {
    $meta: {
      name: 'Whack a Mole 3: Speedup',
      icon: 'code',
      description: `Third game from series`,
      subsection: 'Whack-a-Mole',
      skillChallengeType: 'games',
      ...C.E.$meta,
    },
  },
  mole4: {
    $meta: {
      name: 'Whack a Mole 4: Menus',
      icon: 'code',
      description: `Fourth game from series`,
      subsection: 'Whack-a-Mole',
      skillChallengeType: 'games',
      ...C.E.$meta,
    },
  },
  digger: {
    $meta: {
      name: 'Digger',
      icon: 'code',
      description: `Mining and collecting resources`,
      subsection: 'Digger',
      skillChallengeType: 'games',
      ...C.E.$meta,
    },
  },
}

export default CodeGameSkillNodes
