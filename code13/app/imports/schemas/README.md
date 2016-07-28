Adding a new Data schema

Checklist

- Include from main_server.js
- Add an entry in ./index.js
- Deny from denyRules.js
- Add publications in publications.js
- Add .ensureIndex() as needed in publications.js
- Add any useful validators in validate.js
- Note any denormalizations in the list below (maybe I should add a comemnt convention also?)

Design notes

- In order to help future scalability, we are trying to avoid cross-table joins
- Where we are going to have very infrequent changes of id->name mapping (for example
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