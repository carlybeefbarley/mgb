export const templateTutorial = [
  
  { label: "Simple Tutorial",
    description: "Simple Tutorial with just 4 basic steps",
    code: `{
  "steps": [{
    	"heading": "Your Profile Page",
      "title": "Profile Page",
      "text": "Let's find your profile page",
      "selector": "body",
      "position": "top",
      "showStepOverlay": false
    }, {
      "title": "Navigation panel",
      "text": "Click on the HOME button here",
      "selector": "#mgbjr-navPanelIcons-home",
      "showStepOverlay": false,
      "awaitCompletionTag": "mgbjr-CT-navPanel-home-show",
      "position": "right"
    }, {
      "title": "My Profile",
      "text": "Click on the 'My Profile' button",
      "selector": "#mgbjr-np-home-myProfile",
      "showStepOverlay": false,
      "awaitCompletionTag": "mgbjr-CT-app-router-path-u/:username",
      "position": "right"
    }, {
      "title": "Well done!",
      "text": "You can see it now...",
      "selector": "body",
      "position": "top",
      "showStepOverlay": false
    }
  ]
}`
  }

]