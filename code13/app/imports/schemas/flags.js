import _ from 'lodash'
import { check, Match } from 'meteor/check'
const optional = Match.Optional
import { Chats, Azzets, Flags, Projects } from '/imports/schemas'
import { isUserSuperAdmin, isUserModerator } from '/imports/schemas/roles'

// Another "entity" (e.g Chat message, an Asset, a Project etc) can have
//    zero or one flagId at a time, and that ID will be a key into this table

//
//     0)  WHEN A FLAG IS BORN!^#&^(@*&(!*!!!!!)) **bork bork**
//      {{{{{{8 of 9 months of birthing}}}}}}

//0a: send flagger notification yes we recieved your feedback/input k thx
//     it is awaiting review.
//0b: user cannot flag their own items TODO
//0c: cannot flag item with suFLagid exist
//0d: cannot flag suisbanned == true item
//0e: it create a flag record upon flagging (see schema for deets)
//0f: the id of the new record is put in suFlagId of new entity
//0g: is okay to flag item where isDeleted == true

//  A suFlagId on an Entity will do the following when that entity is used:
//    1) Tell the UI to render '(flagged content)' instead of the content...
//       Moderators can always see the entity (asset, msg etc)
//       Owners can always see the the entity (probably in a red box etc)
//       Others just see 'this item has been flagged as inappropriate'
//       (as described later, resolving the flag (ban or ok by Moderator) will
//       clear this suFlagId value)
// 1a: there is a gap here, that because this is purely a UI update
// it could still render on the client and in a game. but we will live
// with this because we will keep moderation process efficient and fast
//

//    2) Prevent any change to the item EXCEPT removal of flag by Moderator
//       (ensure this with code in the server RPCs)
//      2a) cannot fork asset where suFlagId or suIsBanned exist
//      2b) if project fork start will fail forking flagged assets in proj

//    3) A Moderator can review flagged entities. These can be discovered
//       either in-situ (i.e in the chat list) or in a special 'Moderator
//       Dashboard' view that will look for any entities with a suFlagId

//    4) If the Moderator resolves the flag as 'upheld' (i.e. the content
//      should be banned then the database schema is upodated as follows:
//      4a: Store a clone of the entity in the flag record
//      4b: Replace the content of entity (e.g. message in chat) as 'deleted by
//          moderator'. This means that the design of point (1) above still holds
//          create new function that updates this depending on the entity table AND
//          subtable (music vs. code vs. graphic)
//      4c: set the suIsBanned flag on the entity to true (was banned)
///     4d: remove the suFlagId field from the instance of entity
//      4e: Issue some TBD notification to the owner of the banned content
//      4f: we will not Issue some TBD notification to the flagger of the banned content
//
//
//    5) If the Moderator resolves the flag as 'not banned' (i.e. the
//       content was ok) then the database schema is updated as follows:
//      5a: No change to the content of the entity
//      5b: store clone in the flag record
//      5c: set the suIsBanned flag on the entity to false (not banned)
///     5d: remove the suFlagId field from the instance of entity
//      5e: Issue some TBD notification to the owner of the unflagged content
//      5f: we will not Issue some TBD notification to the flagger of the unflagged content

//    6)
//     6a: in the event that it was banned we want it to render the content
//        but the content is then replaced with some kind of graphic
//        X(some greyed out image) or message.
//    Asset specific:
//        1) could be a bad name
//        2) could be a bad description
///       3) could be bad content
//        4) apis can pull info now so if we doctor the front end it may not be sufficient
//      Assets: we we save the whole entity to the flag
//        we change only te text field to be (Banned by moderator)
// in restApi_common we change the content type to be an image that is red square
// in all the view asset card places
// only the owner can see the asset they also see a box of text saying that it was banned/flagged
//
//     6b: we will not let the user see a list of their banned shit because
//         we will send them a notification/warning instead
//     6c: asset forking prohibited on tems where suIsbanned == true
//6c.1: if project fork start will fail forking banned assets in proj
//
//   7) ban reversal: **** TODO ****
//7a: admin operation to unban something... to do Flags method.
//7b: prvbannedcontent that held the clone is made to be the content of
//entity again
//7c: set suisbanned to false
//7d: send user notification saying "my bad"

//8) reflagging: should just work haha
//8a: user attempts to reflag an item where suIsBanned exist and is false
//8b: allow because content changes a lot of time

// Note also that /app/server/imports/user-analytics.js is an appropriate
// location to

export const flagsSchema = {
  _id: String, // ID of flags

  createdAt: Date, // When created
  updatedAt: Date, // When last updated
  resolvedAt: Date, // when report was resolved

  // i. THE CASE FOR THE PROSECUTION

  // There are potentially 5 distinct users who are related to a flag workflow.. we will need to
  // distinguish these carefully as follows
  //   1. Reporter: (required)    The one person who raised this flag
  //   2. Endorsers: (optional)   [Not Implemented yet] Zero or more people who also endorsed this flag (+1 on the flag report)
  //   3. Owner: (required)       The person who owns a flagged item (thought they may not have been the offender.. e.g a project owner)
  //   4. Offender: (optional?)   [Not implemented yet] The person who performed the action (clear for things like chat, but less so for an asset in a project)
  //   5. Target: (optional)      [Not implemented yet] A person who was the target of the offensive content
  //   6. CaseOwner:  (optional)  The Admin or Mod who will resolve the case

  // Identifiers for who initiated the report (always provided)
  reporterUserName: String, // UserName (not ID)
  reporterUserId: String, // OK, _this_ one is the ID
  reporterComments: optional(String),

  //   // Endorsers... [Not Implemented yet]  This will be useful later if we implement thresholding
  //   endorserNames: optional(Array),           // Array of strings. Other usernames who endorsed

  // Offenders... [Not Implemented yet]  User Info for the offender who performed the reported action
  //   offenderUserId:         optional(String),    // reported User Id who performed the action
  //   offenderUserName:       optional(String),    // reported User's name who performed the action

  // User Info for the owner person who 'owns' the entity where the reported action ocurred
  ownerUserId: optional(String), // reported User Id who performed the action
  ownerUserName: optional(String), // reported User's name who performed the action

  //report details typing created somewhere, perhaps similar to activity.js
  flagTypes: optional(
    Array,
  ) /* {LEAH} I was thinking this could be like the activityType object in activity.js? what do you think? */,
  /* {DG} yes.. a dotted string name is always a flexible approach. We need an array, so an example record might be..
        [ 'abuse.bullying', 'abuse.racial', 'abuse.gender' ]
     */
  //for when there is a flag type we dont have listed that
  //user/mod thinks would be a more appropriate description
  flagTypeOther: optional(String),

  reportedEntity: Object, // { table, recordId, _dbgtxt }
  //for look ups and for ban reversal and for moderator work flow notifications
  entityId: String,
  entityType: String,

  /* The reported entity us potentially a chat message, an asset, a project etc,
 * So might take a 'universal locator' approach where we say it is a 'thing' identified by a
 *  a TableName
 *  a Record _id
 *  an optional (and possible stale) hint/clue/name for easier debugging logs and DBs
 * .. e.g
 *      { table: 'Assets',     recordId: '3i5977wzKm9MFoCRo', _dbgtxt: 'leah:bunny_code' }
 *      { table: 'Chats',      recordId: 'Yey4w9MFoCRoPgQKQ', _dbgtxt: 'G_GENERAL' }
 *      { table: 'Projects',   recordId: '9MFoCRo9MFoCRoQFS', _dbgtxt: 'G_GENERAL'
 */
  // for purposes of moderator dashboard view to see their own and for other admins to see who moderated what
  moderatorUserId: optional(String),
  moderatorUserName: optional(String),
  // if reporter had additional complaints than types provided in report pop-up
  modComments: optional(String), // if Moderator had extra input/observations on flagging matter

  // 2. JUDGEMENT AND SENTENCING

  // TODO: Need resolutions.. GUILTY, NOTGUILTY etc  what was the "crime" (reference TOS section?)

  // BannedContent will be cloned when the moderator upholds the flagging request.
  prvBannedContent: optional(
    Object,
  ) /* {DG} Maybe make this an object.. then for example it could be a clone of an asset/chat/ record.. { asset: __originalAsset } */,

  // ? user outcome stuff?  penalty?
  wasPermBanned: optional(Boolean), //if the content was removed permanently due to the report or stayed/report found unfair

  // ? user outcome stuff?  penalty?
  //isTempBannedDateStart:         optional(Date),    // better to be in
  //put in user-roles record or analytics
  //app/server/imports/user-analytics.js ?
  //isTempBannedDateEnd:           optional(Date)     // better to be in /app/server/imports/user-analytics.js ?
}

export const _parseTableNameToTable = tableNameString => {
  if (tableNameString === 'Chats') {
    const chatEntity = {
      tableCollection: Chats,
      ownerIdKey: 'byUserId',
      ownerNameKey: 'byUserName',
    }
    return chatEntity
  } else if (tableNameString === 'Azzets') {
    const assetEntity = {
      tableCollection: Azzets,
      ownerIdKey: 'ownerId',
      ownerNameKey: 'dn_ownerName',
    }
    return assetEntity
  } else if (tableNameString === 'Projects') {
    const projectEntity = {
      tableCollection: Projects,
      ownerIdKey: 'ownerId',
      ownerNameKey: 'ownerName',
    }
    return projectEntity
  }
  console.error('unknown tablestring type')
  return null
}
///for each entity need to get owner ID because names in schemas are different

//why do i write "percieved"? the internet allows for quite a lot of anonimity, I believe that even someon who is "mistaken"
// in another's identity is still at fault of using discriminatory words, images, videos, references.
// as well the way one identifies themself does not always match the way the world percieves them.
//I've most often seen this in the situaiton that someone percieves someone as gay and targets
//them regardless of the person's actually identity.
//I believe this still counts as intentional discrimination.

//why do i write "enabling"? without saying something themselves a user can egg on another user
//to isolate/harm other user(s) i believe this still counts as a violation of community rules.
export const FlagTypes = {
  'abuse.bullying': {
    displayName: 'bullying',
    description:
      'User was intentionally harassing one or more other users with the intention to socially isolate/humiliate.',
  },
  'abuse.profane': {
    displayName: 'inappropriate/profane',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that are considered inappropriate/vulgar according to MGB community rules.',
  },
  'spam.advert': {
    displayName: 'spam advertising',
    description:
      'Actions, messages, images, videos, or references that are considered spam/promotional according to MGB community rules.',
  },
  'spam.porno': {
    displayName: 'spam pornographic',
    description:
      'Actions, messages, images, videos, or references that are considered spam/pornogrpahic according to MGB community rules.',
  },
  'spam.malware': {
    displayName: 'spam malware/phishing',
    description:
      'Actions, messages, images, videos, or references that are considered spam/malware according to MGB community rules.',
  },
  'abuse.sexualHarassment': {
    displayName: 'Sexual harrasment',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references of a sexual nature intended to cause harm/discomfort',
  },
  'abuse.ageInappropriate': {
    displayName: 'Age inappropriate',
    description:
      'User intentionally or failed to censor/properly label actions, words, videos, images, games, references that would be considered for inappropriate for youth under 18 years of age.',
  },
  'discrimination.racial': {
    displayName: 'Racist/discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon racial identity/percieved race.',
  },
  'discrimination.sexist': {
    displayName: 'Sexist/discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon sex/gender identity/percieved gender.',
  },
  'discrimination.ableist': {
    displayName: 'Ableist/discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon their ablity/percieved ability.',
  },
  'discrimination.LGBTQ': {
    displayName: 'LGBTQ discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon their sexuality/gender identity/gender assignment at birth/percieved sexuality/gender identity.',
  },
  'discirmination.religious': {
    displayName: 'Religious discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon their religion/percieved religion.',
  },
  'discrimination.xenophobic': {
    displayName: 'National/Xenophobic discrimination',
    description:
      'User was intentionally using/enabling actions, slurs, images, videos, or references that would harm/isolate users based upon their national identity/percieved naional identity.',
  },
}

if (Meteor.isServer) {
  Meteor.methods({
    //reported entity
    // const reportedEntity = {
    //   table: String,
    //   recordId: String,
    // }

    'Flags.create'(reportedEntity, data) {
      //data = {
      //   flagTypes: [string],
      //   comments: string
      console.log(reportedEntity)
      console.log(data)
      const currUser = Meteor.user()
      check(reportedEntity, Object)
      check(reportedEntity.table, String)
      check(reportedEntity.recordId, String)
      check(data, Object)
      check(data.flagTypes, Array)

      if (!this.userId) throw new Meteor.error(401, 'Login required')

      const tableInfo = _parseTableNameToTable(reportedEntity.table)

      const TableCollection = tableInfo.tableCollection

      if (!TableCollection) throw new Meteor.Error(404, 'Table collection does not exist')

      const entity = TableCollection.findOne({ _id: reportedEntity.recordId })

      if (!entity) throw new Meteor.Error(404, 'Reported entity does not exist')

      //parse info for the different table fields for ownerId and ownerName
      const entityOwnerId = entity[tableInfo.ownerIdKey]
      const entityOwnerName = entity[tableInfo.ownerNameKey]
      if (entityOwnerId === currUser._id) throw new Meteor.Error(401, 'You cannot flag your own content')

      const newFlagData = {
        flagTypes: data.flagTypes,
        createdAt: new Date(),
        reporterUserName: currUser.username,
        reporterUserId: currUser._id,
        ownerUserId: entityOwnerId,
        ownerUserName: entityOwnerName,
        entityId: entity._id,
        entityType: reportedEntity.table,
      }
      if (data.comments) newFlagData.reporterComments = data.comments

      const flagId = Flags.insert(newFlagData)
      const selector = { _id: entity._id }
      const changedData = {
        updatedAt: new Date(),
        suFlagId: flagId,
      }
      //add situation for if tableData to add tableData
      const count = TableCollection.update(selector, { $set: changedData })

      if (count !== 1) throw new Meteor.error(500, 'Collection did not update')
      Meteor.call(
        'Slack.Flags.unresolved',
        entity,
        entityOwnerName,
        currUser.username,
        newFlagData.createdAt,
        newFlagData.entityType,
      )
      return flagId
    },

    // ---------
    'Flags.resolve'(reportedEntity, data) {
      const currUser = Meteor.user()
      check(reportedEntity, Object)
      check(reportedEntity.table, String)
      check(reportedEntity.recordId, String)
      check(data, Object)
      check(data.wasPermBanned, Boolean)

      if (!this.userId) throw new Meteor.Error(401, 'Login required')

      if (!isUserSuperAdmin(currUser) || !isUserModerator(currUser))
        throw new Meteor.Error(401, 'Access not permitted')

      const tableInfo = _parseTableNameToTable(reportedEntity.table)

      const TableCollection = tableInfo.tableCollection

      if (!TableCollection) throw new Meteor.Error(404, 'Table collection does not exist')

      const entity = TableCollection.findOne({ _id: reportedEntity.recordId })

      if (!entity) throw new Meteor.Error(404, 'Reported entity does not exist')

      if (!entity.suFlagId) throw new Meteor.Error(404, 'Flag Id does not exist.')

      const currFlag = Flags.findOne({ _id: entity.suFlagId })

      const changedFlagData = {
        updatedAt: new Date(),
        resolvedAt: new Date(),
        moderatorUserId: currUser._id,
        moderatorUserName: currUser.username,
        modComments: data.comments,
        wasPermBanned: data.wasPermBanned,
      }
      if (data.wasPermBanned === true) {
        changedFlagData.prvBannedContent = entity
        const entityChangedData = {
          updatedAt: new Date(),
          suIsBanned: true,
        }
        if (TableCollection === Chats) {
          entityChangedData.prvBannedMessage = entity.message
          entityChangedData.message = '(Deleted by moderator)'
        }
        if (TableCollection === Azzets) {
          //we did save entire asset into reportedEntity field of flag- line 373
          //restApi_common.js is where asset card rendering for banned assets is handled line 68
          //saving whole asset allows for retrieval
          entityChangedData.text = '(Deleted by moderator)'
          //TODO: in future we may need to clean up asset name also
          //or begin using profanity filter on asset names
        }
        TableCollection.update({ _id: reportedEntity.recordId }, { $set: entityChangedData })
        TableCollection.update({ _id: reportedEntity.recordId }, { $unset: { suFlagId: '' } })
        const showUpdate = TableCollection.findOne({ _id: reportedEntity.recordId })
        if (!showUpdate) throw new Meteor.Error(500, 'Failed to update table collection')
      }

      if (data.wasPermBanned === false) {
        const entityChangedData = {
          suIsbanned: false,
          updatedAt: new Date(),
        }
        TableCollection.update({ _id: reportedEntity.recordId }, { $set: entityChangedData })
        TableCollection.update({ _id: reportedEntity.recordId }, { $unset: { suFlagId: '' } })
      }
      const nResolved = Flags.update({ _id: currFlag._id }, { $set: changedFlagData })

      return nResolved
    },

    //----------
    'Flags.banReverse'(bannedEntity, data) {
      const currUser = Meteor.user()
      check(bannedEntity, Object)
      check(bannedEntity.table, String)
      check(bannedEntity.recordId, String)
      check(data, Object)
      check(data.wasPermBanned, Boolean)
      console.log(data)

      if (!this.userId) throw new Meteor.Error(401, 'Login required')

      if (!isUserSuperAdmin(currUser) || !isUserModerator(currUser))
        throw new Meteor.Error(401, 'Access not permitted')

      const tableInfo = _parseTableNameToTable(bannedEntity.table)

      const TableCollection = tableInfo.tableCollection
      if (!TableCollection) throw new Meteor.Error(404, 'Table collection does not exist')

      const entity = TableCollection.findOne({ _id: bannedEntity.recordId })

      if (!entity) throw new Meteor.Error(404, 'Banned entity does not exist')

      if (entity.suFlagId)
        throw new Meteor.Error(404, 'This is flagged. Please resolve the flag on this first.')

      const originFlag = Flags.findOne({ entityId: entity._id }) //.first()?
      if (!(entity.suIsbanned === true)) throw new Meteor.Error(404, 'Entity is already not banned.')

      const setPrevData = {
        updatedAt: new Date(),
        resolvedAt: new Date(),
        suIsBanned: false,
        moderatorUserId: currUser._id,
        moderatorUserName: currUser.username,
      }
      console.log(setPrevData)
      if (TableCollection === Chats) setPrevData.message = entity.prvBannedContent
      if (TableCollection == Azzets) setPrevData.something = originFlag.prvBannedContent

      const unBanned = TableCollection.update({ _id: entity._id }, { $set: setPrevData })
      if (!unBanned) throw new Meteor.error(500, 'Failed to unban and update collection')

      return unBanned
    },
  })
}
