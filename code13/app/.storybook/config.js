import { configure } from '@kadira/storybook';

function loadStories() {
  require('../client/imports/__stories.js');
  // You can require as many stories as you need.
}

configure(loadStories, module);