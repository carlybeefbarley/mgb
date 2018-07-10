
Goal:
  Enable an on-premises version (appliance?) of MGB that can be installed/deployed/updated 
  even if not (or never) connected to internet.

  Immediate goal is not to implement this, but to ensure that this can be done if needed 
  with about a week of dev & test & packaging work

Use case:
  We had some serious inquiries from Prisons and similar 'youth correction’ / ‘drug rehab’ 
  type places that wanted to have a version of MGBv1 that they could host inside 
  their facility.
  
  These facilities can have servers, but had no connection to internet.. air gap etc

  It’s a big, under-served and (IMHO) socially beneficial opportunity for us.

Current status:
  We would have to write a utility to bundle up various pieces to make it work but it's
  not too hard since we only really have the one Meteor server today that can do most things
  1. Need to bundle up !vault account and pre-populate in DB
  1. Need to do something about wzrd.io
  1. Need to clone major dependencies like Phaser, Stardust etc
  1. Installer with Meteor build bundle, node, MongoDB and simple MongoDB DB create
  1. Some kind of backup/restore script
  1. Possibly decide on some hardware so we sell as appliance -- makes support MUCH easier
     especially for the backup/restore solution (thumbdrive / CD etc) and for remote management
     for troubleshooting (temporarily connected to internet for remote management). Also 'repair'
     is just ship and return a box, then apply backup. Even upgrade can be done that way for 
     zero-tech support orgs. Probably an intel NUC device.


Architecture impact
  As we do future scalability work, there is an expectation that instead of some of the
  clunky non-scalable apis in restApi.js, we will write/deploy custom microservices to 
  better support those requirements (prosemirror/sharejs service etc).

  We will just need to maintain a simplified, non-scalable solution that works in the Meteor
  server, or have a cost-efficient supportable installer/support model for any extra services
  that will be deployed on-premises

  