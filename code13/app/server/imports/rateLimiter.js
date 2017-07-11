import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'

/*
addRule({
 type: Either "method" or "subscription"
 name: The name of the method or subscription being called
 userId: The user ID attempting the method or subscription
 connectionId: A string representing the user's DDP connection
 clientAddress: The IP address of the user
})
 */
const getDefaultMethodSettings = name => {
  return {
    rule: {
      name,
      type: 'method',
      connectionId: con => true, // limit per connection
    },
    limit: 100, // 5 times
    interval: 1000, // per 1000 ms
  }
}
const getDefaultSubscriptionSettings = name => {
  return {
    rule: {
      name,
      type: 'subscription',
    },
    limit: 100, // 5 times
    interval: 1000, // per 1000 ms
  }
}
const setRules = rules => {
  for (let i in rules) {
    const settings = rules[i](i)
    if (!settings) continue
    DDPRateLimiter.addRule(settings.rule, settings.limit, settings.interval)
    console.log('Rule added', `${settings.rule.name}(${settings.rule.type})`)
  }
}

// map[name: function] with all meteor methods
// Meteor.default_server.method_handlers - this seems too unstable and breaks stuff - so we will collect all methods manually
// replace getDefaultSettings with custom function - return false to ignore
const methods = {
  'Activity.log': getDefaultMethodSettings,
  'ActivitySnapshot.setSnapshot': getDefaultMethodSettings,
  'Azzets.create': getDefaultMethodSettings,
  'Azzets.update': getDefaultMethodSettings,
  'Chats.send': getDefaultMethodSettings, // TODO: add nice flooding message
  'Projects.create': getDefaultMethodSettings,
  'Projects.update': getDefaultMethodSettings,
  'Settings.save': getDefaultMethodSettings,
  'Skill.learn': getDefaultMethodSettings,
  'Skill.forget': getDefaultMethodSettings,
  'Skill.getForUser': getDefaultMethodSettings,
  'User.storeProfileImage': getDefaultMethodSettings,
  'User.setProfileImage': getDefaultMethodSettings,
  'User.updateEmail': getDefaultMethodSettings,
  'User.updateProfile': getDefaultMethodSettings,
  'AccountsHelp.userNameTaken': getDefaultMethodSettings,
  'Slack.Chats.send': getDefaultMethodSettings,
  'Slack.User.create': getDefaultMethodSettings,
  'Slack.Assets.create': getDefaultMethodSettings,
  'Slack.Projects.create': getDefaultMethodSettings,
  'Slack.MGB.productionStartup': getDefaultMethodSettings,
  'job.gamePlayStats.playGame': getDefaultMethodSettings,
  //'job.import.mgb1.project'
}
setRules(methods)

// limit all subscriptions to reasonable count
// LOOKS LIKE A TYPO BUG HERE.. hanler.. @stauzs!?
const knownSubscriptions = Meteor.default_server.publish_handlers
const subscriptions = {}
for (let i in knownSubscriptions) {
  subscriptions[i] = getDefaultSubscriptionSettings
}
setRules(subscriptions)
