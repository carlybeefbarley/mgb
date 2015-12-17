# Using WebStorm as an IDE

This is the recommended IDE for this project.  @dgolds is maintaining these instructions.

## Recommended WebStorm version

Recommended: 

* [WebStorm 11 EAP (WS-143.1183.13)](https://confluence.jetbrains.com/display/WI/WebStorm+11+EAP)
*  (dgolds has a copy in his Google Drive if needed)

**NOTE that source maps aren't correctly being handled if I am using the universe:ecmascript package. C'est la via**

Not recommended:

* WebStorm versions before 11 (does not have full Meteor support)
* WebStorm version 11.0.2 ([Meteor debugging is broken](https://youtrack.jetbrains.com/issue/WEB-19334))


## WebStorm configuration for Meteor

1. [Setup ESLINT](http://info.meteor.com/blog/how-to-set-up-atom-and-webstorm-for-meteor-es6-es2015-and-jsx)
1. Install the [Jetbrains IDE Support for Chrome](https://chrome.google.com/webstore/detail/jetbrains-ide-support/hmhgeddbohgjknpmjagkdomcpobmllji?hl=en)
1. Follow [JetBrain's instructions on using WebStorm with Meteor](https://www.jetbrains.com/webstorm/help/using-meteor.html) 

## WebStorm and .gitignore

Based on [JetBrains' instructions](https://intellij-support.jetbrains.com/hc/en-us/articles/206827587-How-to-manage-projects-under-Version-Control-Systems)
the code/.gitignore file is set to exclude .idea/workspace.xml and .idea/tasks.xml

I also ignored  node_modules  since it was used to bring in ESLINT (http://info.meteor.com/blog/how-to-set-up-atom-and-webstorm-for-meteor-es6-es2015-and-jsx)


