import {Activity} from '../schemas';
import { check, Match } from 'meteor/check';

var schema = {
  
  _id: String,            // ID of this activity

  timestamp: Date,
  activityType: String,   // This is a lookup into a compile-time event Info
  priority: Number,       // 1 = highest.  Used for filtering signal:noise
 
  description: String,    // A description field
  thumbnail: String,      // A few activities will have a graphic - ths is it
  
  // Identifiers for who did the activity
  byUserName: String,     // UserName not ID )
  byUserId: String,       // OK, this one is the ID
  byTeamName: String,     // team owner user NAME (FOR FUTURE USE)
  byIpAddress: String,    // Cool!
  byGeo: String,          // TODO - sone kind of lat/long

  // Identifers for scope of the action
  toProjectName: String,  // null if not a project-scoped action
  toOwnerName: String,    // owner user NAME
  toAssetId: String,      // The asset that was changed - or null if not an asset
  toAssetName: String,    // Asset's name (duplicated here for speed)
  toAssetKind: String     // Asset's kind (image, map, etc)
};

// Info on each type of activty, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const ActivityTypes = {
  "asset.create": { icon: "plus",             pri: 10,  description: "Create new asset" },
  "asset.edit":   { icon: "edit",             pri: 15,  description: "Edit asset" },
  "asset.stable": { icon: "green checkmark",  pri: 6,   description: "Asset marked stable" },
  "asset.unstable": { icon: "red checkmark",  pri: 6,   description: "Asset marked stable" },
  "asset.rename": { icon: "write",            pri: 11,  description: "Rename asset" },  
  "asset.delete": { icon: "red trash",         pri: 12,  description: "Delete asset" },
  "asset.undelete": { icon: "green trash outline", pri: 12,  description: "Undelete asset" },
  
  "user.join":    { icon: "green user",       pri:  5,  description: "User joined" },
  "user.logon":   { icon: "user",             pri:  9,  description: "User Logged In" },
  "user.logout":  { icon: "grey user",        pri:  9,  description: "User Logged Out" },
  
  // Helper functions that handles unknown asset kinds and gets good defaults for unknown items
  getIconClass: function (key) { return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].icon : "warning sign") + " icon"},
  getPri: function (key) { return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].pri : 0)},
  getDescription:  function (key) { return (ActivityTypes.hasOwnProperty(key) ? AssetKinds[key].longName : "Unknown Activity type (" + key + ")")}
};


Meteor.methods({

  "Activity.log": function(data) {
    
    if (!this.userId) throw new Meteor.Error(401, "Login required");

    data.timestamp = new Date();
    data.byUserId = Meteor.userId();    // We re-assert it is correct on server in case client is hacked
    
    if (Meteor.isServer)
    {
      // TODO: Make sure user id info looks legit. Don't trust client
      data.byIpAddress = this.connection.clientAddress;
      data.byGeo = "";      // TODO
      // data.byUserName    TODO: VALIDATE+FIX
      // data.byTeamName    TODO: VALIDATE+FIX
    }
    else
    {
      data.byIpAddress = "";
      data.byGeo = "";      
    }
    
    check(data, _.omit(schema, '_id'));

    var docId = Activity.insert(data);
    console.log(`  [Activity.log]  #${docId}  ${data.activityType}  by: ${data.byUserName}   from: ${data.byIpAddress}`);
    return docId;
  }
  
});



var priorLog;   // The prior activity that was logged - for de-dupe purposes

// Helper function to invoke a logActivity function. If called from client it has a VERY 
// limited co-allesce capability for duplicate activities
export function logActivity(activityType, description, thumbnail, asset) {
 
 let username = Meteor.user().profile.name;
 
  var logData = {
    "activityType":         activityType, // One of the keys of the ActivityTypes object defined above
    "priority":             ActivityTypes.getPri(activityType),
    
    "description":          description || "",  
    "thumbnail":            thumbnail || "",

    // Identifiers for the user/team that initiated the activity
    byUserName:             username,           // TODO - server will also validate
    byTeamName:             "",                 // TODO - server will also validate

    // Identifers for target of the activity
    toProjectName:          (asset && asset.projectName ?  asset.projectName : ""), 
    toOwnerName:            (asset && asset.dn_ownerName ?  asset.dn_ownerName : ""),
    toAssetId:              (asset && asset._id ? asset._id : ""),
    toAssetName:            (asset && asset.name ? asset.name : ""),
    toAssetKind:            (asset && asset.kind ? asset.kind : "")
  };

  let fSkipLog = false;

  if (priorLog && 
      priorLog.activityType === logData.activityType &&
      logData.activityType !== "asset.rename" &&              // This is coallesced already in AssetEditRoute
      priorLog.toAssetId === logData.toAssetId)
    fSkipLog = true;
  
  priorLog = logData;
  
  if (fSkipLog) {
    console.log("Activity is similar to prior logged activity, so not placing in ActivityDB");
  }
  else {
    Meteor.call('Activity.log', logData, (err, res) => {
      if (err) {
        console.log("Could not log Activity: ", err.reason)
      }
    })    
  }

}

