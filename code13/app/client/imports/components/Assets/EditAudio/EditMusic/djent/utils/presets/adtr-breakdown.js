const preset = {
  id: 'adtr',
  description: 'ADTR Breakdown',
  settings: {
    config: {
      bpm: 90,
      hitChance: 0.8,
      allowedLengths: [
        {
          id: '1',
          amount: 1,
        },
        {
          id: '2',
          amount: 1,
        },
        {
          id: '4',
          amount: 2,
        },
      ],
    },
    beats: [
      {
        id: 'total',
        bars: 4,
        beats: 4,
      },
      {
        id: 'groove',
        bars: 2,
        beats: 4,
      },
    ],
    instruments: [
      {
        id: 'g',
        // pitch: 0,
        sounds: [
          {
            id: 'sixth-3-muted',
            enabled: true,
          },
          {
            id: 'sixth-4-muted',
            enabled: true,
          },
        ],
      },
      {
        id: 'k',
        sounds: [
          {
            id: 'k',
            enabled: true,
          },
        ],
      },
      {
        id: 's',
        sounds: [
          {
            id: 's',
            enabled: true,
          },
        ],
      },
      {
        id: 'c',
        ringout: true,
        sounds: [
          {
            id: 'china-left',
            enabled: true,
          },
        ],
      },
      {
        id: 'd',
        sounds: [
          {
            id: 'drone-high',
            enabled: false,
          },
        ],
      },
    ],
  },
}

export default preset
