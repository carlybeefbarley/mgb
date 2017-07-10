import { Sysvars } from '/imports/schemas'

// This is a set of reactive global parameters for a deployment.

// Use cases:
//    Show a new deployment is being rolled out
//    Set a flag to put the system in lockdown due to an attack / overload etc

export const defaultDeploymentName = 'prod00'

var schema = {
  _id: String,
  deploymentName: String, // This is the key to show which deployment is using this data. For now the only & first one will be the value of defaultDeploymentName
  deploymentVersion: String, // Of the format returned by mgbReleaseInfo.getCurrentReleaseVersionString(). Used to indicate when a deployment is rolling out.

  // Future examples of thing we will do with this:
  // safetyValveModeActive:  String,       // if null or undefined, then not in SafetyValve mode. If non-null, (including '') then the value is a human-readable string describing the safety valve reason (e.g. sudden user spike)
  // globalAssetLockActive:  String,       // Same as above, but for a global asset lock mode - for example found a corrupting bug
}

/* Example of mshell code for this

  Sysvars.insert( { deploymentName: 'prod00', deploymentVersion: 'TBD'})


  var Sysvars=require('/imports/schemas').Sysvars
  var thisRel=require('/imports/mgbReleaseInfo').getCurrentReleaseVersionString()
  var thisDeploymentName = require('/imports/schemas/sysvars').defaultDeploymentName  
  Sysvars.update( { deploymentName: thisDeploymentName }, { $set: { deploymentVersion: thisRel} } )

*/

if (Meteor.isServer) {
  Meteor.MGB_UPDATE_SYSVARS_FOR_DEPLOY = () => {
    var Sysvars = require('/imports/schemas').Sysvars
    var thisRel = require('/imports/mgbReleaseInfo').getCurrentReleaseVersionString()
    var thisDeploymentName = require('/imports/schemas/sysvars').defaultDeploymentName
    Sysvars.update({ deploymentName: thisDeploymentName }, { $set: { deploymentVersion: thisRel } })
  }
}
