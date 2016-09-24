ReactJoyride - Tours and Tutorials
==================================

We are using react-joyride for some of the tutorial and tours UI
See https://github.com/gilbarbara/react-joyride for background


This doc file describes the intergation and princples of how to use this consistently 
and easily in our codebase so this does not become a hairball

Primary Integration points
==========================

1. package.json includes react-joyride.
1. App.js embeds the <Joyride> react element, provides the state management for the joyride
   in this.state.joyrideSteps, and provides a method (via props) to the <FlexPanel> element
   so it can add or replace steps. That function is addJoyrideSteps(). See the source for
   it's parameters and options.   Currently only FlexPanels can start tours, but that will 
   probably change in future
1. We SHALL NEVER use react-joyride for tooltips. Semantic UI provides all we need there


Joyride Tour definitions
========================

1. These are simple js objects, and puld also be loaded as JSON.
1. An example is in fpFeatureLevels.js
1. A key requirement for react-joyride is CSS selectors for the elements on the joyride
1. There is no safe way to use React component names, so we must keep with CSS selectors
1. It is STRONGLY encouraged to not have per-step styling in the react-joyride tours
   even though this is permitted

React Joyride CSS selector conventions in MGB
=============================================

To keep this sane, the following rules shall be observied in this codebase:

1. Any added CSS classes or Element IDs for joyrides shall be ONLY used for the 
   react-joyride purposes; They shall NEVER be used also for styling.
1. Any such Element IDs and CSS classes for joyride purposes SHALL ALWAYS be prefixed
   with mgbjr- so that we can easily understand their purpose and if needed serach for them.
1. The following components auto-create useful ids or tags for joyrides:

Toolbar.js
* These are the Feature-Level dependent toolbars. They will automatically add an ID 
  #mgbjr-(toolbarName)-(toolname).   For example #mgbjr-EditGraphic-fillTool

NavBarGadgetUxSlider.js
* This adds the class .mgbjr-NavGadgetSliderIcon to the 'options' Icon next the the slider