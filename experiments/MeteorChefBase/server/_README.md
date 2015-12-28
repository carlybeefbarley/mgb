# /server/ - the meat of the Server code for this Meteor app

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
