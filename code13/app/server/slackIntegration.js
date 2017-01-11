import request from 'request'
import os from 'os'   // Node OS import for os.hostname()
import mgbReleaseInfo from '/imports/mgbReleaseInfo'
// Server side webhook

// The following was defined by dgolds who has config rights for the devlapse.slack.com account:
const mgb_slack_eng__webhookUrl_mgb_community = "https://hooks.slack.com/services/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"


function slackGenericNotify(slackWebhookUrl, data) {
  const options = {
    url: slackWebhookUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':pencil:',
      text: `New ${kind} Asset <${assetUrl}|${assetname}> created by user <${userUrl}|${username}>`
    })
  }
})


Meteor.methods({
  "Slack.Projects.create": function(username, projectname, docId) {

    const userUrl=`https://v2.mygamebuilder.com/u/${username}`
    const projectUrl=`https://v2.mygamebuilder.com/u/${username}/project/${docId}`
    slackGenericNotify(mgb_slack_eng__webhookUrl_mgb_community, {
      username: `MGBv2 @${username}`,
      icon_emoji: ':card_file_box:',
      text: `New Project <${projectUrl}|${projectname}> created by user <${userUrl}|${username}>`
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
