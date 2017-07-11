import C from './CommonSkillNodes.js'
// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]
// These will be inserted into { design: ___ }
// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js
// @hawke Here's a test comment for implementation purposes.
const DesignSkillNodes = {
  $meta: {
    name: 'Design',
    description: 'Represents game and level design skills',
  },
  gameplay: {
    // ludology.  Fancy word for the study of gameplay.  What's a game, what isn't?
    'what is game design?': C.E, // focus on what game design is and isn't.
    'backstory through gameplay': C.E, // in games avoid the WALL OF TEXT (or the dreaded cut-scene), players want exposition through gameplay not being told or shown.
    'setting versus mechanics': C.E, // explain the differences between the proverbial crunchy bits and fluffy bits.  Maybe 2 art assets, one for fluffy and one for crunchy.  Each would describe an event in their respective tones.
    'art or design': C.E, // where does the design of the fluffy bits leave the realm of the designer and enter the world of the art director?
    pacing: C.E, // what does the speed of a level tell you?  An action game might have a frentic pace, where a horror game might have a more measured pace.
    mood: C.E, // how can the puzzles and fluffy bits contribute to the mood of a game?
    agency: C.E, // what meaningful choices do your players think they have?  What choices do you want them to have?
    'the narrative': C.E, // does the game have a writer?  If so how does your design contribute to what (s)he has written?
    'the arc of action': C.E, // description of rising action from the inciting incident to the climax and finally to the resolution.  Game difficulty should roughly follow the same arc.
    'teach then use': C.E, // give a player a new ability, then give them a few places where they can practice that ability.
    'game design questions': {
      'is it fun': C.E, // prototyping helps find the fun faster!
      'is it interesting': C.E, // ??  I guess maybe you were thinking about fluffy bits.
      'is it challenging': C.E, // touch on balance and user experience.
      'is it social': C.E, // if your game is a multiplayer game, what social elements exist?
    },
    // @stanchion.. more here pls?
    //
  },

  'game-mechanics': {
    'the importance of balance': C.E, //talk about how unbalanced games ruin the fun.
    'types of balance': C.E, //  symmetric vs. asymmetric balance.
    gating: C.E, // keeping the player the right level for the challenges they face.
    scaling: C.E, // having the challenges increase in difficulty based upon player success.
    customization: C.E, // giving the player Agency to control aspects of his or her avatar.
    'metagame and core game mechanics': {
      // specific examples of mechanics that illustrate different balance issues.
      'symmetric balance': {
        // games where each choice is functionally the same, although the fluffy bits may vary
        'rock-paper-scissors': C.E, // one of the most common mechanics in the world.  Symmetric because rock, paper, and scissors each have an equal effect (They beat 1 and lose to 1)
        'mirror match or mirrored maps': C.E, // nothing says symmetric balance like a perfect reflection of abilities and locales.  The deciding factor is the player's skill.
        // more to come
      },
      'asymmetric balance': {
        'unique Characters': C.E, // games like fighting games or mobas typically feature characters with different abilities
        'location bonuses': C.E, // maps that aren't mirrored give advantages, how do you balance that?
        'player skill': C.E, // balancing a powerful ability with a complex button combination or series of button presses.  The balance lies in the player's limitations.
        handicaps: C.E, // a way of offsetting differences in player skill by making the less skilled player's character more powerful so the end result is the players' characters are balanced.
        // more to come
      },
      'risk vs reward': {
        // discussion of how to use risk and reward mechanisims to motivate player behavior.
        'low hanging fruit': C.E, // easy objectives should be common to encourage the players
        'fortune favors the bold': C.E, // put valuable things in hard to reach, or dangerous places
        'skinner boxes': C.E, // what we can learn from rats pushing a button and farmville or cow clicker.
        // more to come
      },
      'other game mechanics': {
        'how many is too many': C.E, // different mechanics for different parts of a game are great, but how many is too many?
        'comprehensive list': {
          // a cheat sheet for mechanics, including short descriptions of ones we don't go into detail on.
          'quicktime events': C.E, // show a button, the player must parrot that button back in a short time.
          //more to come
        },
      },
    },
    'final-objectives': {
      'win conditions': C.E,
      'why losing can be fun': C.E, // discussion of how to make it so that losing the game isn't a negative experience.
      'infinite-play': C.E, // does an activity without a win/lose state even count as a game?  Is it ok if it isn't a game?
    },
    'common game mechanics': {
      // these show up with alarming frequency in some form in most games.
      health: {
        // the arbitrary hit point?
        'initial health': C.E,
        'max health': C.E,
        'recovery rates': C.E,
        healing: C.E,
        'max-health boost': C.E,
        'extra lives': C.E,
      },
      combat: {
        // what combat subsystem do you want to design?  How do you balance it?
        melee: C.E,
        'touch-damage': C.E,
        shots: C.E,
        'direct-damage': C.E,
        'splash-damage': C.E,
        'reflected-damage': C.E,
      },
      defense: {
        // how to balance tanks with damage dealers.  Is it fun for everyone?
        armor: C.E,
        agility: C.E,
        stealth: C.E,
        invulnerability: C.E,
      },
      modifiers: {
        buffs: C.E, // items/abilities/consumables which increase the abilities of one of the actors in a game.
        debuffs: C.E, // items/abilities/consumables which decrease the abilities of one of the actors in a game.
        'special abilities': C.E, // items/abilities/consumables which are unique to a character or require player skill to execute.
      },
      puzzles: {
        sokoban: C.E, // move those crates
        'item gating': C.E, // collect the hookshot to progress past that chasm
        'math puzzles': C.E, // who knew, right?  things like sodoku or measuring/weight puzzles can be adapted for gameplay
        'light reflection': C.E, // just 4 more mirrors and I've got it.
        riddles: C.E, // A box without hinges key or a lid...
        'boolean switches': C.E, // if you hit the first button, lights 1, 3, and 5 change states.  If you hit the second button 2, 3, 4 change....  get them all lit.
        'combine the blocks': C.E, // four red blocks in a row cause a small explosion, chains of explosions ensue.  Tetris, Dr. Mario, Bejewelled, Candy Crush...
        'find the ladder': C.E, // then position it against the right wall in the right way to climb up to the next level...
        'logic puzzles': C.E, // the warrior was NOT the one who was killed in the crypt with a dagger, the cleric was not in the dungeon, the wizard and the person who died in the crypt did not use the mallot...
        //more to come
      },
      'in-game-rewards': {
        loot: C.E, //items and consumables that give buffs (not counting currency)
        'currency systems': C.E, // I have 100k League Points, 20K riot points, and 120K Experience points... none of which my character has.  All in the same game.
        'character improvement': {
          // only 200 more rats and I hit level 2!
          'level based abilities': C.E, // a form of gating, you allow players abilities based upon crossing a gate (1000xp, for example)
          'skill trees': C.E, // a specific combination of customization and gating, actors gain abilities along a path of nodes, each requiring prerequsite nodes to unlock.
          'aestetic unlocks': C.E, // more customization, this time artistic.  Bigger, more attractive equipment as you become stronger.
        },
      },
    },
  },
  'pacing specific issues': {
    progression: C.E, // too fast and players don't have time to master lower level items.  Too slow and players get bored and frustrated.
    grinding: C.E, // I need you to kill me 5 moose...  Rinse repeat.  Glorified skinner box.
    bosses: C.E, // have the skills the player learned in the hours getting to the boss the same skills they need to actually defeat the boss.
  },
  'level design': {
    // a part of the whole.
    'level design is game design': C.E, // each level should have a story it tells with a beginning a climax and a conclusion.
    'level design questions': {
      // questions to ask when designing a level.
      'what does my level say?': C.E, // this is a bit esoteric, I may reword it.  Is it a long, open level or a clausterphobic tight puzzle?  What gameplay styles benefit from this level's design?  Which do poorly?
      'how does my level fit into the overall design': C.E, // does it fit in with the levels next to it?  Too many of the same puzzles / bosses / fights in a row?
      'how does my level fit into the narrative': C.E, // does the decoration and flow of the level match with what the narrative is trying to say?
      'how does my level into the difficulty arc of the game': C.E, // the game designer should have given you some indication of how 'hard' your level should be.  Is it harder than that?  Easier?
      'what special assets might my level need?': C.E, // important objects that are unique to your level that the art team will have to make.  A Hero (high-poly specific) tree or crashed spaceship are examples.
    },
    'linear vs sandbox': C.E, // are there one (or a couple) paths that a player can take, or is it mostly an open area that they figure out their own way.
    '2d vs 3d': C.E, // in 3d design, don't overlook the importance of different elevations in the overall design.
    'line of sight': C.E, // who can see what from which positions.  Does the sniper have a view of an area that the target is going to be in?  Can the guard see the character from a specific location.
    flow: C.E, // how do players move throughout your level?
    'level contents': {
      // what assest are going to be in your level?
      enemies: C.E,
      allies: C.E,
      hazards: C.E,
      loot: C.E,
      collectables: C.E,
      quests: C.E,
      'quest items': C.E,
      'hero items': C.E, // things that are unique to your level that set it apart from other levels.  Usually, but not always, accompanied by custom assets.
    },
    'code specific issues': {
      pathing: C.E, // what places can players and ai controlled characters move on?  What's the most efficient path there?
      occlusion: C.E, // what areas are visible from different points in a level.
      backtrack: C.E, // can the player move backwards in the level to areas already explored?  If so, what happens?  Is it required for them to win?
      'secrets and hidden items': C.E, // secret items hidden in the level.  May require special code or scripting to make work.
      'bottlenecks and chokepoints': C.E, // deliberate or accidental places where many actors try to move through or must move through.
      'polycounts and other hardware issues': C.E, // large open rooms can sometimes be problematic as could having 200K unique items in a view at once.  How can your level design break up some of these problems?
    },
  },
  'multiplayer ranking': {
    'win bonusses': C.E,
    'loss penalties': C.E,
    ELO: C.E,
    ranking: C.E,
    matchmaking: C.E,
    // @stanchion.. others?
  },
}

export default DesignSkillNodes
