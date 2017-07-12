var FS = require('fs')
var ReadLine = require('readline')
var InfiniteLoop = require('infinite-loop')

const EVENT_FAILED        = 'failed'
const EVENT_REJECTED      = 'rejected'
const EVENT_COMPLAINED    = 'complained'
const EVENT_UNSUBSCRIBED  = 'unsubscribed'
const EVENT_DELIVERED     = 'delivered'
const EVENT_OPENED        = 'opened'
const EVENT_CLICKED       = 'clicked'

// select event
const EVENT = EVENT_OPENED


// ########################## MAILGUN ######################################
const getMailgunSeconds = function (time) {
  return (new Date(time).getTime()/1000).toString()
}

var api_key = 'key-98c5eedae6607896b14f1a9b22f1785b'
var domain = 'mailgun.mygamebuilder.com'
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain})
const logCountLimit = 100     // max 300 per request
const startDate = getMailgunSeconds('May 6, 2017')  // day when email campaign started
var counter = 0


getEvents(startDate)

function parseResult(result){
  // console.log(result)
  let emailString = ''
  result.items.forEach((item) => {
    // if(item.severity == 'temporary') return false // don't log temporary fail
    console.log(item.recipient)
    counter++
    emailString += item.recipient + ',\n'
  })
  console.log('----total count', counter)
  // console.log('emails', emailString)
  FS.appendFile(EVENT+".csv", emailString, function(err) {
    if(err) { return console.log(err)  }
  })

  if(result.items.length > 0){
    var recentRecipient = result.items[result.items.length-1]
    var recentDate = recentRecipient.timestamp
    var newDate = parseFloat(recentDate) + 0.001
    newDate = newDate.toString()

    setTimeout(() => getEvents(newDate), 5000)
  }
}

function getEvents(date){
  console.log('-----', date)
  const opts = { begin: date, ascending: 'true', limit: logCountLimit, event: EVENT }
  if(EVENT == 'failed'){
    opts.severity = 'permanent'
  }
  mailgun.events().get(opts)
  .then((result) => {
      parseResult(result)
    })
}
