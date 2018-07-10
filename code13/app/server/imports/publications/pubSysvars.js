import { Sysvars } from '/imports/schemas'
import { defaultDeploymentName } from '/imports/schemas/sysvars'

//
//    SYSVARS (will be keyed by deploymentName (in future))
//

Meteor.publish('sysvars', function() {
  return Sysvars.find({ deploymentName: defaultDeploymentName })
})
