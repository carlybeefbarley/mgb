# MGB - Understanding the codebase

## Origins

This project started from the following baseline: 

* https://github.com/themeteorchef/getting-started-with-react

This React-Base was in turn based upon https://github.com/themeteorchef/base

* The Meteor Chef - Base Version v3.3.0 (November 1st 2015). 
* [Read the Docs - Meteor Base](http://themeteorchef.com/base)
* [Read the Docs - Meteor+React Base](https://themeteorchef.com/recipes/getting-started-with-react/)
* [Read the Docs - Module convention used in this code](https://themeteorchef.com/snippets/using-the-module-pattern-with-meteor/)

Thus this 'javascript' source code is a mix of ES2015 and JSX. Read the above docs if those aren't familiar to you.

## Meteor build process and magic folder names

[Meteor’s build process](http://docs.meteor.com/#/full/structuringyourapp) loads the appropriate files subject to several load ordering rules. They are applied sequentially to all applicable files in the application, in the priority given below:

1. HTML template files are always loaded before everything else
1. Files beginning with main. are loaded last
1. Files inside any lib/ directory are loaded next
1. Files with deeper paths are loaded next
1. Files are then loaded in alphabetical order of the entire path

Any magic server-side env variables are exported into Modules.server.setEnvironmentVariables by server/modules/set-environment-variables.js

Summarized from [this article](https://themeteorchef.com/snippets/organizing-your-meteor-project/#tmc-special-directories): 
* client/	- used to store all code that’s meant to run on the client-side of our application. Any files located in a directory called client will be loaded on the client-side (browser) only. This is used as an alternative to writing our code in if ( Meteor.isClient ) {} blocks.
* server/	- used to store all code that’s meant to run on the server-side of our application. Any files located in a directory called server be loaded on the server-side only. This is used as an alternative to writing our code in if ( Meteor.isServer ) {} blocks.
* /public	- used to store all files that are meant to be served publicly. Images, graphics, and other static assets can live here. Note: these will live directly off the root URL of your application like http://localhost:3000/file.jpg.
* /private - used to store private data files and can only be accessed on the server. Files in this directory can be loaded on the server using the Assets API. For example, things like email templates or seed data can be stored here.
* /client/compatibility	- used for “JavaScript libraries that rely on variables declared with var at the top level being exported as globals. Files in this directory are executed without being wrapped in a new variable scope. These files are executed before other client-side JavaScript files.”
* /tests - is not loaded anywhere and is intended for storing test code (e.g. see the Velocity framework).
* /i18n - is the i18n and localization support, which provide the global i18n object and the global T React component for translation.

## Running it

At the simplest, [install Meteor](https://meteor.com) and then type 'meteor' in this /code/ folder

## Startup code

* Client startup code is in /client/modules/startup.js
* Server startup code is in /server/modules/startup.js
* The outer html for the site is defined in /application.html

## /collections/ - Client and Server definitions of Meteor Collections used in this system

The /collections folder defines collections that are used on both client and server side, synced via Meteor's DDP system. These \*.js files define the schema and the allow/deny rules for the collections. Because the folder name isn't a 'magic' folder name like 'client' or 'server', this file is loaded on both client and server contexts

Notes:

* Dummy data isn't defined/loaded here. Instead that is being done (for now) in server/modules/\*.js
* Publication (allowing data to be synced from server to client) isn't defined here. Instead that is defined in /server/publications/\*.js


## Routing and consequent ReactLayout.render() calls

Note that this codebase uses [Flow-Router](https://github.com/kadirahq/flow-router) for routing urls to the correct actions and renders.

* The main routes are defined in /both/routes/*.js and these then usually call ReactLayout.render(). There are some extra event handlers to make sure login and logout events get handled ok.  
* There are also some router helper functions in client/helpers/flow-router.js - notably pathFor(), urlFor() and currentRoute()
  * See also the full [Flow-Router API](https://github.com/kadirahq/flow-router#api)

Extra code can be added for [Triggers](https://github.com/kadirahq/flow-router#triggers) to perform tasks before enter into a route and after exit from a route.

## Client-only: Top level page layout

The client/components/layouts/default.jsx file has the layout for the overall app as 
```
   <div className="app-root">
      <AppHeader />
      <div className="container">
        {this.props.yield}
      </div>
    </div>
```

## Client-only: React Components for UI elements

The React components for the UI are under client/components. These are separated into *authenticated*, *public* (aka unauthenticated), and *global* (can be authenticated or non-authenticated).
There is supporting code for the *public* components in client/modules/*.js - typically relating to login, signup etc

## Client-only: Stylesheets

Stylesheets are defined using SCCS and are in client/stylesheets

## Client-only: startup code

The intent is for client startup code to be defined in client/modules/startup.js
The file client/startup.js wires this to Meteor.startup


## /server/ - the meat of the Server code for this Meteor app

'server' is a magic folder name for Meteor and indicates that the code in here is for the server only, not for the client (browser).

### /server/admin/ - Server code for admin-related tasks

The initial example here is code to send an email for a password reset

### /server/modules/

Most server-related non-crud operations are defined in /server/modules/\*.js files and then \_modules.js exports these via Modules.server 

There are some TEMPORARY initializers with fake data for user accounts and people - generate_acounts.js and generate-people.js. TODO:dgolds] These need to be removed.

### /server/publications/

Here are where the publications of collections from Server to clients are defined. These are needed since the (scaffolding) Meteor package autopublish has appropriately been removed from this project.

### /server/startup.js

Here is where the server startup code defined in server/modules/startup.js is bound to Meteor.startup() on the Server.


## /both/ - BOTH Client and server...

### /both/methods

This is where [Meteor Methods](http://docs.meteor.com/#/full/meteor_methods) are defined. 

Initially, these include some CRUD functions on the sample collection but (TODO:dgolds) these need to be cleaned up

### /both/modules

Similar to client/modules, and server/modules.. this is a place to define modules of code that cab be used in either context.

### /both/routes

* /both/routes/authenticated.jsx defines the routes (and a flow-router group) for authenticated controls/pages
  * It includes a redirect to the login page if the user is not logged in
  * Routes for unauthenticated pages like signup, login etc are in /both/routes/public.jsx
* 404 handling is done by the FlowRouter.notFound() handler in /both/routes/configure.jsx
* There's also some magic for login support in /both/routes/configure.jsx
  * An Accounts.onLogin() handler to jump to the landing page (index currently) when a Login succeeds
  * A Tracker.autorun to handle any case where the user becomes logged out, and dump them at the login page    

## Miscellaneous strange stuff


### /node_modules/ - tools stuff

For compatibility with node.js **tools** used alongside Meteor, any directory named node_modules is not loaded anywhere. node.js packages installed into node_modules directories will not be available to your Meteor code. Use Npm.depends in your package package.js file for that.

* eslint - installed as part of the developer toolchain for use with WebStotm to help find errors in the soure code.

For compatibility with node.js tools used alongside Meteor, any directory named node_modules is not loaded anywhere. node.js packages installed into node_modules directories will not be available to your Meteor code. Use Npm.depends in your package package.js file for that.
### /packages/ - non-Meteor-managed dependencies

This folder contains some more tool stuff. 

[TODO:dgolds] Look into this some more. May be unnecessary?

### /private/ - ??? idk what

All files inside a top-level directory called private are only accessible from server code and can be loaded via the [Assets API](http://docs.meteor.com/#/full/assets). This can be used for private data files and any files that are in your project directory that you don't want to be accessible from the outside.

### /public/ - just the favicon for now

[TODO:dgolds] Look into this some more. May be unnecessary? It's something to do with emails?
