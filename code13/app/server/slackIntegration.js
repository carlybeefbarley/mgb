import _ from 'lodash'
import axios from 'axios'
import os from 'os' // Node OS import for os.hostname()
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

// Server side webhooks to Slack:

// The following were defined by dgolds who has config rights for the devlapse.slack.com
// account at https://devlapse.slack.com/services/
const mgb_slack_eng__webhookUrl_mgb_community =
  'https://hooks.slack.com/services/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'
const mgb_slack_eng__webhookUrl_mgb_deploys =
  'https://hooks.slack.com/services/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'

const DISABLE_SLACK_NOTIFICATIONS = false

const MUTE_ASSET_CREATE_NOTIFICATIONS = true
const MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS = 'tester,stauzs,dgolds,Bouhm,guntis,SuperAdmin,teacher2'.split(
  ',',
)

function slackGenericNotify(slackWebhookUrl, data) {
  if (DISABLE_SLACK_NOTIFICATIONS) {
    console.log('DISABLE_SLACK_NOTIFICATIONS set, preventing Slack Notifications')
    return
  }

  axios
    .post(slackWebhookUrl, data)
    .then(({ data }) => {
      console.log('Messaged Slack Webhook OK :', data)
    })
    .catch(({ request, response, message, config }) => {
      console.log('Error: Making Slack Webhook request with config:', config)

      if (response) {
        console.log('Error: Slack Webhook response status >2xx:', message, response)
      } else if (request) {
        console.log('Error: Slack Webhook did not respond:', message)
      } else {
        console.log('Error: Slack Webhook request could not be set up: ' + message)
      }
    })
}

Meteor.methods({
  'Slack.Chats.send'(username, message, channel) {
    const infoUrl = `https://v2.mygamebuilder.com/u/${username}?_fp=chat.${channel}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      text: `Message from user <${infoUrl}|${username}> on channel <${infoUrl}|#${channel}>`,
      attachments: [
        {
          fallback: `Message: '${message}'`,
          //        pretext: "Message",
          color: '#D00000',
          fields: [
            {
              title: `Message on #${channel}`,
              value: message,
              short: false,
            },
          ],
        },
      ],
    })
  },
})

Meteor.methods({
  'Slack.Chats.censored'(username, message, channel, censoredMsg) {
    const infoUrl = `https://v2.mygamebuilder.com/u/${username}?_fp=chat.${channel}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':bangbang:',
      text: `Rejected CENSORED Message attempt by user <${infoUrl}|${username}> on channel <${infoUrl}|#${channel}>`,
      attachments: [
        {
          fallback: `Message: '${message}'`,
          //        pretext: "Message",
          color: '#D00000',
          fields: [
            {
              title: `Message on #${channel}`,
              value: `Original: '${message}' \nWould censor to: '${censoredMsg}'`,
              short: false,
            },
          ],
        },
      ],
    })
  },
})

Meteor.methods({
  'Slack.Classrooms.create'(username, classroomName) {
    const userUrl = `https://v2.mygamebuilder.com/u/${username}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':smile:',
      text: `Creating New Classroom  (${classroomName}) by user <${userUrl}|${username}> `,
    })
  },
})

Meteor.methods({
  'Slack.User.create'(username, email) {
    const userUrl = `https://v2.mygamebuilder.com/u/${username}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':smile:',
      text: `Creating New user <${userUrl}|${username}> (${email})`,
    })
  },
})

Meteor.methods({
  'Slack.User.eradicated'(username, infoObject) {
    const userUrl = `https://v2.mygamebuilder.com/u/${username}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':gun:',
      text: `@${Meteor.user().username} eradicated user <${userUrl}|${username}> (${JSON.stringify(
        infoObject,
      )})`,
    })
  },
})

Meteor.methods({
  'Slack.Assets.create'(username, kind, assetname, docId) {
    const userUrl = `https://v2.mygamebuilder.com/u/${username}`
    const assetUrl = `https://v2.mygamebuilder.com/u/${username}/asset/${docId}`
    const text = `New ${kind} Asset <${assetUrl}|${assetname}> created by user <${userUrl}|${username}>`

    if (
      MUTE_ASSET_CREATE_NOTIFICATIONS ||
      _.includes(MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS, username)
    )
      console.log(`Muted Slack.Assets.create notify for user '${username}': '${text}`)
    else
      slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
        username: `MGBv2 @${username}`,
        icon_emoji: ':pencil:',
        text,
      })
  },
})

Meteor.methods({
  'Slack.Projects.create'(username, projectname, docId) {
    const userUrl = `https://v2.mygamebuilder.com/u/${username}`
    const projectUrl = `https://v2.mygamebuilder.com/u/${username}/project/${docId}`
    const text = `New Project <${projectUrl}|${projectname}> created by user <${userUrl}|${username}>`
    if (_.includes(MUTE_ASSET_AND_PROJECT_CREATE_FOR_SPECIAL_USERS, username))
      console.log(`Muted slack notify for user '${username}': '${text}`)
    else
      slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
        username: `MGBv2 @${username}`,
        icon_emoji: ':card_file_box:',
        text,
      })
  },
})

Meteor.methods({
  'Slack.Cloudfront.notification'(message, isBad) {
    if (Meteor.isProduction) {
      slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_deploys, {
        username: `MGBv2 Cloudfront bot`,
        icon_emoji: isBad ? ':cyclone:' : ':cloud:',
        text: message,
      })
    } else {
      console.log(`will send to slack ${isBad ? 'bad' : ''}:`, message)
    }
  },
})

Meteor.methods({
  'Slack.MGB.productionStartup'() {
    const mgbVer = `Iteration ${mgbReleaseInfo.releases[0].id.iteration}`
    const configDumpMsg = !os
      ? '(no OS object)'
      : `
[
  MGB=${mgbVer}
  Hostname=${os.hostname()}
  Meteor=${Meteor.release}
  Arch=${os.arch()}
  CpuCount=${os.cpus().length}
  FreeMem=${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)}GB
  TotalMem=${os.totalmem() / (1024 * 1024 * 1024)}GB
  OS=${os.platform()}-${os.release()}
]`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_deploys, {
      username: `(MGBv2 DEPLOYMENT ENGINEER)`,
      icon_emoji: ':airplane_departure:',
      text: `MGB PRODUCTION DEPLOYMENT STARTUP ${configDumpMsg}`,
    })
  },
})

Meteor.methods({
  'Slack.Flags.unresolved'(entity, ownerUsername, reporterUsername, createdAt, entityType) {
    let infoUrl = ''
    let userUrl = ''
    if (entityType == 'Chats')
      infoUrl = `https://v2.mygamebuilder.com/u/${ownerUsername}?_fp=chat.${entity.toChannelName}`
    if (entityType == 'Azzets') userUrl = `https://v2.mygamebuilder.com/u/${ownerUsername}`
    infoUrl = `https://v2.mygamebuilder.com/u/${ownerUsername}/asset/${entity._id}`

    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${ownerUsername}`,
      icon_emoji: ':ok:',
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
  },
})
