

A key part of the scaling strategy for MGB's data model is to minimize server-side joins via
denormalization.

This file notes the cases where there have been denormalization (duplication of data that can
become potentially inconsistent if changes are partial)

Denormalized data
=================
1. Asset.dn_ownerName is denormalized. If we implement a User-rename operation in future, 
   it will have to implement a  bulk-update these
1. Asset.projectNames[] array describes the Asset's project membership. The model is fully
   specified in comments in schemas/projects.js, but the most terse and complete definition is
   that "An 'asset' may only belong to zero or more of the asset-owner's projects)". The most painful 
   denomalization leaks are into activity.js and activitySnapshot.js but these are transient
   self-erasing-tail log-type data records, so we can reconsider this later in our design work. 


Server-side "joins" in our codebase
===================================

1. canUserEditAsset - depends on project membership. See the very long comment 
   in schemas/projects.js that describes this system. The key is that the client will provide 
   hints to the let the server discover an answer quickly.. O(1), BUT the server is not reliant 
   on the client's veracity :)  moreover if the client tries to 'DDoS' by a bad hint, 
   it will have it's writes rejected.

1. projects.js - in Meteor.call("Projects.deleteProjectId"). Not a join, but a 2nd query
   to see if there are assets in the project.