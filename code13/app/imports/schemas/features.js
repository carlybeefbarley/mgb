// This is a way to track usage of features.
// This will likely go to a specialized DB at some point

// The primary goals are
//   G1. Track & report usage of the MGB codebase features by User & Release tag
//   G2. For our users to track also usage of features in their apps/games

// Client API Requirements:
//   C1. It is important that it is a VERY convenient api to put in client codebase
//       because it will be extremely common
//
//   C2. It must be possible to determine a User's PERCENTAGE feature usage of
//       the potential feature set - so there MUST be an easy way to determine
//       the full domain of potential features
//
//   C3. The feature usage must be tracked, measured and reported by User
//
//   C4. The feature usage must be tracked, measured and reported by 'Release'
//
//   C5. The feature usage
//
//  C10. There is some degree of overlap in functionality with other analytics
//       functions such as Google Analytics, so it would be VERY nice ff this can
//       be condensed with GA, or an analytics abstraction such as analytics.js
//
//  C11. There is some degree of overlap in functionality with ActivitySnapshots,
//       and it would be nice if this can be condensed into a single API+DB
//

// Network requirements:
//
//  N1.

// Analytics requirements
//
//  A10. Ability to measure and represent 'conversion' (precise definition TBD)

// ideally it would be

/*

  import MFT from /imports/featureTracker



  MFT.base("graphics,edit,)

 */

// Things we could 'just use' (needs to be in NodeJs to avoid server sprawl, and MIT licensed)

// GA:
//   Includes reporting API: https://developers.google.com/analytics/devguides/reporting/core/v4/
// See https://developers.google.com/tag-manager/devguide#datalayer etc
// a good client would be https://github.com/nfl/react-metrics
// Good example of how to do it: https://css-tricks.com/learning-use-google-analytics-effectively-codepen/
// Fixing spam: http://help.analyticsedge.com/spam-filter/definitive-guide-to-removing-google-analytics-spam/
