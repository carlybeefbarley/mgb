import { addDecorator, configure } from '@storybook/react'
import { withKnobsOptions } from '@storybook/addon-knobs'
import { setOptions } from '@storybook/addon-options'
import * as semanticStyles from '/client/imports/styles/semantic-ui-less/semantic.less'


// ----------------------------------------
// Addons
// ----------------------------------------

// Options
setOptions({
  name: 'My Game Builder',
  url: 'http://build.games',
  goFullScreen: false,
  showLeftPanel: true,
  showDownPanel: true,
  showSearchBox: false,
  downPanelInRight: true,
  sortStoriesByKind: true,
})

// Knobs
addDecorator(
  withKnobsOptions({
    // Same as lodash debounce
    debounce: { wait: '100', leading: false },
    // Don't emit events while user is typing
    timestamps: true,
  }),
)

// ----------------------------------------
// Stories
// ----------------------------------------
function loadStories() {
  // dynamically load all *.stories.js files in /client/imports
  const storyCtx = require.context('../client/imports', true, /__stories__\/.*\.stories\.js$/)
  storyCtx.keys().forEach(storyCtx)

  // load the example stories
  require('./__stories__/Example.stories')
}

configure(loadStories, module)
