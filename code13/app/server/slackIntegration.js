import _ from 'lodash'
import request from 'request'
import os from 'os'   // Node OS import for os.hostname()
import mgbReleaseInfo from '/imports/mgbReleaseInfo'
// Server side webhook

// The following was defined by dgolds who has config rights for the devlapse.slack.com account:
const mgb_slack_eng__webhookUrl_mgb_community = "https://hooks.slack.com/services/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"

const DISABLE_SLACK_NOTIFICATIONS = false

const MUTE_ASSET_CREATE_NOTIFICATIONS = true
const MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS = 'tester,stauzs,dgolds,Bouhm,guntis,SuperAdmin'.split(',')

function slackGenericNotify(slackWebhookUrl, data) {

  if (DISABLE_SLACK_NOTIFICATIONS)
  {
    console.log("DISABLE_SLACK_NOTIFICATIONS set, preventing Slack Notifications")
    return
  }

  const options = {
    url: slackWebhookUrl,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    json: data
  }

  function callback(error, response, body) {
    if (!error)
      console.log("Messaged Slack Webhook OK :", JSON.parse(JSON.stringify(body)))
    else
      console.log('Error when messaging Slack Webhook: '+ error)
  }

  request(options, callback)
}


Meteor.methods({
  "Slack.Chats.send": function(username, message, channel) {

    const infoUrl=`https://v2.mygamebuilder.com/u/${username}?_fp=chat.${channel}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      text: `Message from user <${infoUrl}|${username}> on channel <${infoUrl}|#${channel}>`,
      attachments: [
        {
          fallback: `Message: '${message}'`,
//        pretext: "Message",
          color: "#D00000",
          fields: [
            {
              "title": `Message on #${channel}`,
              "value": message,
              "short": false
            }
          ]
        }
      ]
    })
  }
})



Meteor.methods({
  "Slack.Chats.censored": function(username, message, channel, censoredMsg) {

    const infoUrl=`https://v2.mygamebuilder.com/u/${username}?_fp=chat.${channel}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      text: `Rejected CENSORED Message attempt by user <${infoUrl}|${username}> on channel <${infoUrl}|#${channel}>`,
      attachments: [
        {
          fallback: `Message: '${message}'`,
//        pretext: "Message",
          color: "#D00000",
          fields: [
            {
              "title": `Message on #${channel}`,
              "value": `Original: '${message}' \nWould censor to: '${censoredMsg}'`,
              "short": false
            }
          ]
        }
      ]
    })
  }
})



Meteor.methods({
  "Slack.User.create": function(username, email) {

    const userUrl=`https://v2.mygamebuilder.com/u/${username}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':smile:',
      text: `Creating New user <${userUrl}|${username}> (${email})`
    })
  }
})

Meteor.methods({
  "Slack.Assets.create": function(username, kind, assetname, docId) {

    const userUrl=`https://v2.mygamebuilder.com/u/${username}`
    const assetUrl=`https://v2.mygamebuilder.com/u/${username}/asset/${docId}`
    const text=`New ${kind} Asset <${assetUrl}|${assetname}> created by user <${userUrl}|${username}>`

    if (MUTE_ASSET_CREATE_NOTIFICATIONS ||
        _.includes(MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS, username))
      console.log(`Muted Slack.Assets.create notify for user '${username}': '${text}`)
    else
      slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
        username: `MGBv2 @${username}`,
        icon_emoji: ':pencil:',
        text: text
      })
  }
})


Meteor.methods({
  "Slack.Projects.create": function(username, projectname, docId) {
    const userUrl=`https://v2.mygamebuilder.com/u/${username}`
    const projectUrl=`https://v2.mygamebuilder.com/u/${username}/project/${docId}`
    const text=`New Project <${projectUrl}|${projectname}> created by user <${userUrl}|${username}>`
    if (_.includes(MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS, username))
      console.log(`Muted slack notify for user '${username}': '${text}`)
    else
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':card_file_box:',
      text: text
    })
  }
})

Meteor.methods({
  "Slack.Cloudfront.notification": function(message, isBad){
    if(Meteor.isProduction) {
      slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
        username: `MGBv2 Cloudfront bot`,
        icon_emoji: isBad ? ':cyclone:' : ':cloud:',
        text: message
      })
    }
    else{
      console.log(`will send to slack ${isBad ? 'bad' : ''}:`, message)
    }
  }
})

Meteor.methods({
  "Slack.MGB.productionStartup": function() {
    const mgbVer = `Iteration ${mgbReleaseInfo.releases[0].id.iteration}`
    const configDumpMsg=!os ? "(no OS object)" : `
[
  MGB=${mgbVer}
  Hostname=${os.hostname()}
  Meteor=${Meteor.release}
  Arch=${os.arch()}
  CpuCount=${os.cpus().length}
  FreeMem=${(os.freemem()/(1024*1024*1024)).toFixed(2)}GB
  TotalMem=${os.totalmem()/(1024*1024*1024)}GB
  OS=${os.platform()}-${os.release()}
]`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `(MGBv2 DEPLOYMENT ENGINEER)`,
      icon_emoji: ':airplane_departure:',
      text: `MGB PRODUCTION DEPLOYMENT STARTUP ${configDumpMsg}`
    })
  }
})

Meteor.methods({
  "Slack.Flags.unresolved": function(entity, ownerUsername, reporterUsername, createdAt, entityType) {
    let infoUrl = ''
    if(entityType == 'Chats')
      infoUrl=`https://v2.mygamebuilder.com/u/${ownerUsername}?_fp=chat.${entity.toChannelName}`

    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${ownerUsername}`,
      text: `Flag created by user <${infoUrl}|${reporterUsername}> on ${createdAt.toString()} at ${infoUrl}`,
//       attachments: [
//         {
//           fallback: `Message: '${message}'`,
// //        pretext: "Message",
//           color: "#D00000",
//           fields: [
//             {
//               "title": `Message on #${channel}`,
//               "value": `Original: '${message}' \nWould censor to: '${censoredMsg}'`,
//               "short": false
//             }
//           ]
//         }
//       ]
    })
  }
})
