HOWTO: Add a new Data schema to MGB

Checklist

- Add an entry in ./index.js which defines the Mongo/Meteor Collection
- add a new file for the schema - e.g. ./flags.js   (See assets.js for example)
- Include this new file from main_server.js
- Add deny rules in  denyRules.js
- Add publications in publications/index.js
- Add .ensureIndex() as needed in publications/pubXXXXX.js
- Add any useful validators in validate.js
- Note any denormalizations in the list below (maybe I should add a comment convention also?)

Design notes

- In order to help future scalability, we are trying to avoid cross-table joins
- Where there will be frequent changes of id->name mapping (for example
  user._id <--> user.profile.name) we are ok with denormalizing the data to prevent 
  too many joins

List of denormalizations

- assets.js
  - asset.ownerId  asset.dn_owerName
- activity.js
  - lots!  (mostly userIDs/userNames & assetId/assetName)
- activitySnapshots.js
  - lots!  (mostly userIDs/userNames & assetId/assetName)
- chats.js
  -  (mostly userIDs/userNames)