import _ from 'lodash'
import { Projects } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import { bestWorkStateName, defaultWorkStateName, makeWorkstateNamesArray } from '/imports/Enums/workStates'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals.js'
//
// MGB PROJECTS SCHEMA
// This file must be imported by main_server.js so that the Meteor methods can be registered
//

// The 'projects' concept is a BIG DEAL in MGB, so get ready for a big-ass comment explaining it
// all. Got a coffee? You may need one :)

// This will explain how Users, Assets, and access-rights are connected;  how we can avoid
// Ux complexity; how we enable very high scale/performance;  and how we design-out many kinds of
// data-model-corruption so they cannot exist in the system.  Ok, here goes:

//
// PART A: BACKGROUND and CONCEPTS
//

// PROBLEM STATEMENT
//
// The fundamental problem in collaboration is that you (as a user) want to allow some people to do
// some things to your stuff, but not be able to mess your stuff up. You need a way to express your
// access intent in a way that you can understand, they can understand, and that the system can
// implement in a usable/performant way.

// CONCEPTUAL BACKGROUND
//
// OUTSIDE OF MGB, the most conventional conceptual models for the user<->assets<->rights triad are:
// 1) Access Control Lists: ACLs. In this model, every 'Object' has an associated data structure that
//    describes what various users can do to them (by ID or 'group', and later by 'role')).
//     For example "EVERYONE: FULL CONTROL" is the widest policy in Windows, or chmod +777 in Posix-like systems
// 2) ROLES/RIGHTS -oriented models are where 'Users'' have associated data that states their
//    rights to various types of objects, possibly with a ruleset describing which objects might be included/excluded from the policy (location, name, id etc)
//    Novell's "NetWare OS" was an OS that used this as their primary access model, and many modern
//    systems have an role-based-access-control (RBAC) of this kind
//
// See https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&ved=0ahUKEwi04I_77f7OAhUOxGMKHbGfCtcQFggoMAE&url=http%3A%2F%2Fcsrc.nist.gov%2Fgroups%2FSNS%2Frbac%2Fdocuments%2Fcost_benefits%2Fiirf.ps&usg=AFQjCNFlRaW6iYIVF2P46ZBcVkukCZSOyQ&sig2=GumKSmuGEoCQog5ba9dfgQ&cad=rja
// However, most rich systems end up with a complicated fusion of both concepts..
// Sometimes annotating 'objects' with rules describing user's access, and
// ..sometimes giving User's 'rights' that apply to some classification of objects

// GOALS FOR MGB
//
// Our overall goal in MGB is to provide the most common/important use cases of a rich collaborative
// engineering system, but to streamline administrative complexity. The Projects ux/design model
// described here is the most significant design choice in that regard, and it is an explicit rejection
// of more conventional multi-axis models
//
// In addition, an overarching design intent in MGB is to strogly avoid server-side joins for any common
// queries. See /code13/app/DeveloperDocs/AvoidingServerSideJoins.md for details.
//
// Thus we _definitely_ want to make sure access-right checks on the servers for assets/projects/rights
// will avoid joins, OR (at the least) do them in a way that is reduced to at most a single cacheable lookup.

// CHOSEN DESIGN DIRECTION (meeting above goals)
//
// Our chosen projects/assets data model for MGB intentially collapses (i) user-grouping
// (e.g. teams), (ii) asset-grouping (e.g a project-folder) and (iii) rights-management
// (e.g access controls) into a SINGLE unified concept we will call a PROJECT.
//
// YES.. THIS UX/DESIGN CHOICE IS VERY UNUSUAL (POSSIBLY NOVEL), BUT _VERY_ INTENTIONAL.

// DESIGN CONTRAST
//
// Not convinced? Go manage a github system of repos/organizations/rights and you'll see how
// complex the admin model is when a system allows those three concepts to be managed as
// orthogonal concepts :)  It is hard to configure, and is hard to see at a glance what the actual
// in-effect policy is.. and visualizations are hard when there are so many independent degrees of
// freedom in the user<->assets<->rights triad.
//

//
// PART B: DEFINITION
//

// The ASSET/PROJECTS/USERS RELATIONSHIP (AXIOMS and some relevant use-case commentary)
//
//   Names and IDs..
//
//   Assets   always have exactly one "User" Owner and an Asset Name (which can be null, and need not be unique)
//   Projects always have exactly one "User" Owner and a Project Name (which must not be null and should be unique)
//     Users are uniquely and reliably keyed by a global UUID (User._id)
//     Users have a profile.name which the system will attempt to keep unique
//     for human convenience, but is NOT a data model constraint.
//    User rename is a heavyweight, rare and strongly discouraged operation.
//      It's ok for User rename to be computationally expensive if that helps implementation elsewhere

//     The Asset data structure is uniquely keyed by a global UUID     (Asset._id)
//     The Projects data structure is uniquely keyed by a global UUID  (Project._id)

//     An Asset object includes the User ID of the Asset Owner as Asset.ownerId
//       (The Asset object also contains a DENORMALIZED ownerName as an optimization to avoid joins in list scenarios)
//     A Project object includes the User ID of the Project Owner as Project.ownerId
//       (The Project object also contains a DENORMALIZED ownerName as an optimization to avoid joins in list scenarios)

//     An Asset has a 'name'' property which is scoped to the Asset's Owner, but is NOT necessarily
//      unique for the User). It is a convenient label, not an invariant link/identifier.
//      Sometimes the user will want to refer to something by intended 'name' like 'MachineGunSound'
//      but the actual asset that represents that may change (much like swapping files via rename)
//      Asset rename is a _lightweight_ and common/encouraged operation

//     A Project has a 'name property which is scoped to the Project's Owner, but is NOT necessarily
//      unique for the User, though we will strive to avoid duplicates since there will be relatively
//      few projects per user . Project is a convenient label, not an invariant link/identifier.
//      (this will make more sense later when we explain later how to handle some of the use cases
//      that typically cause forks/branches in other content structures - but for now, imagine a case
//      where staging/production/test get rotated by project renames...)
//
//      Project rename is a _midweight_ and supported operation but only for advanced
//      use cases / users / scenarios. Essentially a very small number of users may do it frequently,
//      so it can be costed as a 'pro' feature and extra server costs supported by a price premium.

//    Containment Rule:
//       Assets MAY _ONLY_ belong to (zero or more of the) Projects that the Asset's Owner is ALSO the Owner of
//       Users MAY _ONLY_ belong to (zero or more of the) Projects they do not own

//    Containment Encoding:
//        Projects contain a list of Users by ID who are defined as Project Members;
//        Assets contain a list of Project NAMES (which will share owner) which are the Projects which contain that Asset
//
//    ( Interlude...
//      You may want to read the prior line again. Yes: Asset's state their project membership (i.e the
//      asset<->project mapping) as a list of PROJECT NAMES attached to each Asset in the project...
//      ...yup...NAMES: Asset.projectNames = [ "game1", "game1soundz", "needsCopyrightReview", "game2" ].. woah!?
//      Has that sunk in yet? Good :)  No, we're not crazy. At least we don't think so. The reasons will start to
//      make sense when you look at the asset list scenarios, particularly the broad cross-user, cross-project
//      asset searches that we want to encourage - these could drive a lot of lookups to a userId->UserName table.
//      However, more significantly, by using Project NAME as the reference, and encoding the assumption that
//      the (and also via some extra definitions below) we have a data model that CANNOT express an invalid
//      state. For example.. suppose that we had said the Asset instead listed projects-it-belongs-to by a
//      list of Project._ID values instead... ? well, then it would be possible (encodable) that the
//      Asset.owner===Project.owner invariant would not hold.. Moreover, it would require expensive
//      cross-table joins/queries to detect this 'corruption'.
//      A third benefit of using Project Names is that there is no temporary invalid state during other
//      non-atomic operations like project rename (this is because of the extra rule we will define below that
//      says a missing Project{owner:x,name:y} implicitly exists and has an empty list of Project Members...
//      that final rule solves many interstitial cases and underpins recovery UX for project meta-data-loss
//      cases)
//
//
//    ..Note also from the above that a Project Owner is NOT a Project Member.
//      These are modelled as two DISTINCT responsibilities, even though in practice a Project Member's
//      capabilities is a proper subset of the Project Owner's capabilities ) in terms of operations on
//      the Project or it's assets. This decision was made to (a) avoid a redundant piece of data and
//      (b) avoid an error case existing where a user could be the owner but missing from the Member list.
//      It is an unnecessary data state and potential error/complexity that we are designing out of
//      data model. If the Project Owner ID did appear in the Project Member list, the
//      specified behaviour is to display that 'member' but disregard it from access calculations
//      i.e. Owner-status overrules membership-status when deciding access decisions.
//
//      ok.. back to defining things now..
//    )

//
//    Access Computation:
//      Project Owners ALWAYS have full access control to change/create/destroy any Asset or Project data they own
//        (caveat - some tasks will force a partially reversible locking sequence - for example 'destroy' is
//         really mark-as-deleted followed by system-defined-garbage-collection, and some assets might be
//         marked as 'locked' and this flag must be removed before any other changes can happen to the asset.
//         However, this is not access control per-se, it is an ordering of supported events and state
//         transitions on the objects
//
//      Project Members MAY make limited types of modifications to Assets that are in Projects they are
//        members of. The operations that are permitted are universally defined. Project Membership is NOT
//        'qualified' by extra metadata stating what subset the Member can do.
//
//    ( Discussion...
//
//     err... Equality for all!?
//      Yup, All Project Members all have equivalent rights. There can be no special snowflakes on the team.
//      This means that the other parts of the system need to support the scenarios of (a) the
//      incompetent/inexperienced/partiallyTrusted member who should have a subset of capabilities, and
//      (b) the second-in-command who should also be able to do a subset of operations and have access to
//      some special data.
//      We will address (a) with a (i) number of reversibility and change-tracking fetaures - much as a wiki
//      system does. This provides a better 'ask-for-forgiveness' rather than 'ask-for-permission' culture
//      and is a cultural norm we will intentionally encourage in teams.
//      We also address (a) by (ii) allowing some of the assets to be put in another project ALSO and
//      for some extra people to be members of that project - for example 'art backgrounds'. Finally
//      we also address (a) by referencing: An asset in Project X is allowed to reference an asset/package etc
//      in Project Y.   (The documentation on package design and referencing is TBD, but essentially
//      it's a weak link with some grooming processes to warn when strange things might/will/have happen(ed)'.
//      We will (later) addresss (b) via ability to clone a project, and to later rename/swap projects. That lets
//      the second-in-command take the 'fork' forwards, then swap ownership back with the owner when the
//      time is right to do so.
//
//     ok.. and... what about read-only for protected projects?
//      Yup, there is no read-only access. Everyone has read access to everything in the initial system.
//      This is again an intent as MGB is primarily a hobby/training/experiment site.
//      IF we need to IMPLEMENT private projects though, the model implementation CAN be expanded as follows:
//       Stage 1. Add a new flag for an Asset that states it can only be viewed by the Asset Owner or Project Members
//       Stage 2. Add a new flag for an Asset that states it can only be viewed by Owner, Project Members or
//                (a new project-attached list) of project Viewers).. and of course this list for Project with the
//                same rules/format as for Project Member, and the distinct separation of Owner|Member|Viewer)
//    )
//
// Containment Axioms (summary):
//   A 'project'' has exactly one owner (This invariant is enforced by the data format :)
//   An 'asset' can only have one owner (This invariant is enforced by the data format :)
//   An 'asset' owner MUST also be the project owner (this is enforced by the data format)
//   An 'asset' can be part of zero-or-more 'projects' as long as they are all owned by the asset owner.
//    If the 'asset name' does not currently exist, that membership is still valid - but the project is
//    implicitly without a Member list.  If detected, the API/DB could recover from this by re-creating
//    an empty project with that name as a groomer/housekeeper-initaied DB health action
//
// Rights Axioms (summary):
//  A user can ALWAYS modify/destroy/create assets they own, regardless of the asset's project memberships
//    (including the asset being in no projects)
//  A member of a project has a subset of rights to modify (including changing the mark-as-deleted flag) Assets for projects
//    they are members of
//  TBD: A member of a project can ?SOMETIMES? create new assets in a user's project *which would be owned by the Project Owner)
//  TBD: A member of a project can ?SOMETIMES? edit the project membership of an asset they do not own (thus adding/removing it to a project)
//
// Consequences of Axioms (recap) that are enforced in the data model's design and the contrary cannot be expressed in teh notation/system as designed:
//  A Project MAY contain no Assets
//  An Asset MAY be part of no Projects
//  An Asset MUST never have no Owner
//  An Asset MUST never have two-or-more owners
//  Every Asset in a Project MUST be owned by the Project owner (asset.ownerId ==== project.ownerId)
//  All Assets in a Project MUST have the same owner
//  An Asset MUST never be in two Projects which have different owners (in fact our chosen data structure has no way to represent this case - intentionally)

// What sucks?
//   Nothing is perfect.
//    The main pain point of this system is that when writes occur to an asset, it
//    can be the case that there were multiple reasons that the write was permitted
//    (i.e by the User being a Project Member of TWO projects that the asset was also
//    contained in both projects). This is logically valid and explicitly+intentionally
//    part of the data model and UX, but there will be some Ux confusion risk explaining
//    which right(s) were evaluated to permit the write; and also some potential logging/auditing
//    additional complexity to log all potential reasons for an outcome.. However, this
//    also is the case in classical ACL and RBAC systems that allow once to specify mutiple
//    simultaneous ways for User X to be alowed to write to object Y (i.e own the file, and I'm a
//    backup-operator'). However, our uniformity of access ('equality') removes the really nasty
//    edge conditions of requesting/giving least/most rights for any operation. Dodged another bullet!
//
//    The nastiest axiom to check is that Project Names are distinct per user - but this is very localized data
//    scoped to userId so not hard/expensive to do

//  Computationally, Project rename will be a bit of a pain, but limited in scope to a single user's
//  data, so sharding it in a way to keep the changes on the same node will be very reasonable
//  (probably shardHash by f(OwnerId).  User rename is also a bit harder.
//  TODO: The activity and activitySnapshot data models use the denormalized owner and project names
//        and it may be worth revisiting them.. however, they are self-erasing data formats that 'age out'
//        so we can revisit that later without risk of a major database 'migration' to a different
//        schema/encoding.
//

// TODO: Math proofs that the stated (and other) self-enforcing invariants are really intrinsinc and
// that no additional validation/grooming is required to detect/repair data model corruption (DGolds/Bartosz?)

const optional = Match.Optional
const schema = {
  _id: String,
  assignmentId: optional(String), // if is project is an assignment

  createdAt: Date,
  updatedAt: Date,

  ownerId: String, // owner user id
  ownerName: String, // owner user name (DENORMALIZED)

  // Various flags
  allowForks: Boolean,

  // Fork information (similar to approach used on assets)
  // These fields are not present on a project unless created as part
  // of a project-fork operation
  forkChildren: optional(Array), // Array of peer direct children
  forkParentChain: optional(Array), // Array of parent forks

  // mgb1Import Info IF this project was imported from MGB1. NOT Changeable once set
  mgb1: optional(Object), // { mgb1username: String, mgb1ProjectName: String, importInitiator: String(mgb2username), importProgress: String }

  // the actual project information
  name: String, // Project Name (scoped to owner). Case sensitive
  description: String, // A description field
  workState: String, // A value matching a key from workStates.js
  memberIds: [String], // Array of memberIds (User._id keys)
  avatarAssetId: String, // Asset that will be used as the avatar for this project (should be of kind=graphic)
  assignmentDetail: optional(String),
  dueDate: optional(String),
}

// Helper functions

/* This is intended for use by publications.js and any Meteor.subscribe calls when finding
 * projects relevant to a user
 *
 * @export
 * @param {String} userId. If provided, then filter to only select projects owmned by or joined by userId. If null/undefined, then this selector will *not* filter for ownership/membership.
 * @returns {Object} A MongoDB selector to find projects that userId is owner OR member of
 */
export function projectMakeSelector(userId, nameSearch, showOnlyForkable = false, hideWorkstateMask = 0) {
  const sel = {}

  if (userId) sel['$or'] = [{ ownerId: userId }, { memberIds: { $in: [userId] } }]

  if (showOnlyForkable) sel.allowForks = true

  if (hideWorkstateMask > 0) {
    const wsNamesToLookFor = makeWorkstateNamesArray(hideWorkstateMask)
    sel['workState'] = { $in: wsNamesToLookFor }
  }

  if (nameSearch && nameSearch.length > 0) {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    sel['name'] = { $regex: new RegExp('^.*' + nameSearch, 'i') }
  }

  return sel
}

// MongoDB sorters for Projects collection
export const projectSorters = {
  edited: { updatedAt: -1 },
  name: { name: 1 },
  createdNewest: { createdAt: -1 },
}

// Make some handy shortcuts for defaults
export const defaultProjectSorterName = 'createdNewest'
export const defaultProjectSorter = projectSorters[defaultProjectSorterName]

/**
 * This is used by the Front Page hero list. It's kind of lame
 *
 * @export
 * @returns  {Object} A MongoDB selector to find projects to put on the front page
 */
export function projectMakeFrontPageListSelector() {
  return { workState: bestWorkStateName }
}

/***
 * Check if the user has write access to a list of provided project Objects via Project Membership
 * @param currUserId - the User._id string key for the currently logged in User.
 * @param asset - the asset object from assets.js  If null, then return value is NULL (we have no data to use). We will care specifically about asset.ownerId and asset.projectNames[]
 * @param currUsersProjects - the array of projects (from projects.js) that the currently Logged in user is owner/member of. null/undefined is treated as an empty array []
 * @returns {Array} of projectName,isCurrUserProjectOwner,isCurrUserProjectMember
 */
export function calculateProjectAccessRightsForAsset(currUserId, asset, currUsersProjects = []) {
  if (!asset) return null

  return _.map(asset.projectNames, pName => ({
    projectName: pName,
    isCurrUserProjectOwner: asset.ownerId === currUserId, // Pretty simple logic for this given that it's our axiom
    isCurrUserProjectMember: _.some(
      currUsersProjects,
      usrProj =>
        usrProj.name === pName &&
        usrProj.ownerId === asset.ownerId &&
        _.includes(usrProj.memberIds, currUserId),
    ),
  }))
}

const OWNED_COLOR = 'green'
const MEMBER_COLOR = 'blue'
const NOACCESS_COLOR = 'grey'

/**
 * This is a helper for visuals. It uses the ProjectTableEntries returned from calculateProjectAccessRightsForAsset() above
 * It returns a css color string, e.g. "red"
 */
export const getColorNameForProjectAccess = pte =>
  pte.isCurrUserProjectOwner ? OWNED_COLOR : pte.isCurrUserProjectMember ? MEMBER_COLOR : NOACCESS_COLOR

const OWNED_MSG = 'owner'
const MEMBER_MSG = 'member'
const NOACCESS_MSG = 'no access'

/**
 * This is a helper for visuals. It uses the ProjectTableEntries returned from calculateProjectAccessRightsForAsset() above
 * It returns a css color string, e.g. "red"
 */
export const getMsgForProjectAccess = pte =>
  pte.isCurrUserProjectOwner ? OWNED_MSG : pte.isCurrUserProjectMember ? MEMBER_MSG : NOACCESS_MSG

export const getProjectAvatarUrl = (p, expires = 3600) =>
  p.avatarAssetId.length
    ? `/api/asset/cached-thumbnail/png/${expires}/${p.avatarAssetId}`
    : '/images/wireframe/image.png'

const _calcMaxNumMembersAllowedInProject = user =>
  isUserSuperAdmin(user)
    ? SpecialGlobals.quotas.SUdefaultNumMembersAllowedInProject
    : SpecialGlobals.quotas.defaultNumMembersAllowedInProject

const _calcMaxOwnedProjectsAllowed = user =>
  isUserSuperAdmin(user)
    ? SpecialGlobals.quotas.SUdefaultNumOfOwnedProjectsAllowed
    : SpecialGlobals.quotas.defaultNumOfOwnedProjectsAllowed

Meteor.methods({
  //
  // PROJECT CREATE
  //

  /** Projects.create
   *  @param data.name           Name of Project. Must be unique for
   *  @param data.description    Description field
   */
  'Projects.create'(data) {
    // 0. Perform Input/User Validations
    checkIsLoggedInAndNotSuspended()
    checkMgb.projectName(data.name)
    checkMgb.projectDescription(data.description)
    const user = Meteor.user()
    const username = user.profile.name

    // Note that this check will also run on the client, but could potentially fail to
    // find a conflict (since the client's subscription might not include all the user's
    // projects.. but that's ok since the check will run again on the server and that
    // will definitely have access to all records
    if (Meteor.isServer) {
      const numProjectsOwnedByUser = Projects.find({ ownerId: this.userId }).count()
      if (numProjectsOwnedByUser >= _calcMaxOwnedProjectsAllowed(Meteor.user()))
        throw new Meteor.Error(401, 'Max number of projects reached')
    }

    const existingProject = Projects.findOne({ ownerId: this.userId, name: data.name })
    if (existingProject)
      throw new Meteor.Error(
        403,
        `Project ${username}:${data.name} already exists. Try again with a different name`,
      )

    // Note: forkParentChain and forkChildren were added on 2/19/2017 so earlier
    // projects do not have them. For consistency, I have chose to NOT add
    // them at create-time even to new Projects created after this date.
    // These two array fields (forkParentChain and forkChildren) will instead
    // be created when needed by the ProjectFork Meteor call RPC

    // TODO: disallow forkChildren[] and forkParent[] if this comes from the client.
    //       Note that the server-side ForkAsset RPC *will* need to set forkParent[]

    // 1. Create new Project record and store in Collection
    const now = new Date()
    data.createdAt = now
    data.updatedAt = now
    data.ownerId = this.userId
    data.ownerName = username
    data.workState = defaultWorkStateName
    data.allowForks = false
    data.memberIds = []
    if (!_.isString(data.avatarAssetId)) data.avatarAssetId = ''

    check(data, _.omit(schema, '_id'))
    let docId = Projects.insert(data)

    // 2. Handle post-create actions and return docId of new record
    if (Meteor.isServer) {
      console.log(`  [Projects.create]  "${data.name}"  #${docId}  `)
      if (!user.profile.isGuest) {
        Meteor.call('Slack.Projects.create', username, data.name, docId)
      }
    }
    return docId
  },

  //
  // PROJECT UPDATE
  //

  'Projects.update'(docId, data) {
    // 0. Perform Input/User Validations
    checkIsLoggedInAndNotSuspended()
    check(docId, String)
    const currUser = Meteor.user()
    if (data.description) checkMgb.projectDescription(data.description)
    // Load ownerId and name of existing record to make sure current user is the owner
    const selector = { _id: docId }
    const existingProjectRecord = Projects.findOne(selector, {
      fields: { ownerId: 1, name: 1, memberIds: 1 },
    })
    if (!existingProjectRecord) throw new Meteor.Error(404, 'Project Id does not exist')
    if (existingProjectRecord.ownerId !== this.userId && !isUserSuperAdmin(currUser))
      throw new Meteor.Error(401, "You don't have permission to edit this")
    if (data.memberIds && data.memberIds.length > _calcMaxNumMembersAllowedInProject(currUser))
      throw new Meteor.Error(401, 'You have exceeded the maximum number of members allowed')

    // 1. Create new Project record and store in Collection
    const now = new Date()
    data.updatedAt = now

    // Whitelist which data fields can be updated in this call. Note that we do not
    // allow forkChildren[] and forkParent[] to be updated via this method since it can be
    // invoked from the client
    check(data, {
      updatedAt: schema.updatedAt,
      name: optional(schema.name),
      description: optional(schema.description),
      workState: optional(schema.workState),
      allowForks: optional(schema.allowForks),
      memberIds: optional(schema.memberIds),
      avatarAssetId: optional(schema.avatarAssetId),
    })

    const count = Projects.update(selector, { $set: data })
    if (Meteor.isServer)
      console.log(`  [Projects.update]  (${count}) #${docId} '${existingProjectRecord.name}'`)

    return count
  },
  'Projects.leave'(projectId, userId) {
    checkIsLoggedInAndNotSuspended()
    check(projectId, String)
    check(userId, String)
    if (userId !== this.userId) throw new Meteor.Error(404, 'User Id does not match current user Id')

    const selector = { _id: projectId }
    const project = Projects.findOne(selector, { fields: { memberIds: 1, ownerId: 1, name: 1 } })
    if (!project) throw new Meteor.Error(404, 'Project Id does not exist')
    if (userId === project.ownerId) throw new Meteor.Error(404, 'Project owner may not leave the project')
    var newData = {
      memberIds: _.without(project.memberIds, userId),
      updatedAt: new Date(),
    }
    const count = Projects.update(selector, { $set: newData })
    if (Meteor.isServer) console.log(`  [Projects.leave]  (${count}) #${projectId} '${project.name}'`)

    return count
  },

  //
  // PROJECT FORK
  //
  // ..Note that the  PROJECT FORK  implementation is in assets-server within the Meteor
  // Method "Project.Azzets.fork". It is there since it must perform many asset-related
  // operations during the fork operations.
  //
})
