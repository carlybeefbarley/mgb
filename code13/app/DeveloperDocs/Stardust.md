Stardust is the Ui framework we will be using going forwards for all MGB Ui

Stardust is the official ReactJs wrapper for SemanticUI
* See https://technologyadvice.github.io/stardust/


Stardust is integrated and seems to be working ok side-by-side with normal Semantic UI.
* We might have two overlapping semantic .css files but they don’t seem to be 
   causing an issue since they are the same.. 
* let @dgolds know if you observe any issues though


Migration plan
==============

I would like to use this for new components and we will slowly move old components to use it:

1. New Components should be written using Stardust
1. Initial examples include fpSuperAdmin.js and fpNetwork.js
1. Don't rush to move the scary complex components like EditGraphic or EditMap to Stardust!
   instead, let @dgolds decide when to update existing React components
