

// The Actual ACTORS importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeActors flag (caller should have checked)

//  Avoid throwing Meteor.Error()


export const doImportActors = rva => {
  // TODO
  rva
}
