# MGB - Understanding the codebase

## Origins

This project started from the following baseline: 

* https://github.com/themeteorchef/getting-started-with-react

This React-Base was in turn based upon https://github.com/themeteorchef/base

* The Meteor Chef - Base Version v3.3.0 (November 1st 2015). 
* [Read the Documentation- Meteor Base](http://themeteorchef.com/base)
* [Read the Documentation- Meteor+React Base](https://themeteorchef.com/recipes/getting-started-with-react/)

Thus this 'javascript' source code is a mix of ES2015 and JSX. Read the above docs if those aren't familiar to you.

Any magic server-side env variables are exported into Modules.server.setEnvironmentVariables by server/modules/set-environment-variables.js

## Running it

At the simplest, [install Meteor](https://meteor.com) and then type 'meteor' in this /code/ folder

## Startup code

* Client startup code is in /client/modules/startup.js
* Server startup code is in /server/modules/startup.js

## /collections/ - Client and Server definitions of Meteor Collections used in this system

The /collections folder defines collections that are used on both client and server side, synced via Meteor's DDP system. These \*.js files define the schema and the allow/deny rules for the collections. Because the folder name isn't a 'magic' folder name like 'client' or 'server', this file is loaded on both client and server contexts

Notes:

* Dummy data isn't defined/loaded here. Instead that is being done (for now) in server/modules/\*.js
* Publication (allowing data to be synced from server to client) isn't defined here. Instead that is defined in /server/publications/\*.js


## Routing

Note that this codebase uses [Flow-Router](https://github.com/kadirahq/flow-router) for routing (converting between url and what to do). 
There are also some router helper functions in client/helpers/flow-router.js - notably pathFor(), urlFor() and currentRoute()

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

...describe  [TODO:dgolds]

### /both/modules

...describe  [TODO:dgolds]

### /both/routes

...describe  [TODO:dgolds]


## Miscellaneous strange stuff


### /node_modules/ - tools stuff

This folder is for the node modules installed by npm. This is actually just for tool support, and contains just the following for now:

* eslint - installed as part of the developer toolchain for use with WebStotm to help find errors in the soure code.

### /packages/ - non-Meteor-managed dependencies

This folder contains some more tool stuff. 

[TODO:dgolds] Look into this some more. May be unnecessary?

### /private/ - ??? idk what

[TODO:dgolds] Look into this some more. May be unnecessary? It's something to do with emails?

### /public/ - just the favicon for now

[TODO:dgolds] Look into this some more. May be unnecessary? It's something to do with emails?
