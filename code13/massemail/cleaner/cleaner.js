var FS = require('fs')
var ReadLine = require('readline')
var InfiniteLoop = require('infinite-loop')

var lineReader = ReadLine.createInterface({
  // input: FS.createReadStream('complained.csv')
  input: FS.createReadStream('unsubscribed.csv')
})

const complainedArr = []
lineReader.on('line', function (line) {
  let email = getEmailFromLine(line)
  if(email) complainedArr.push(email)
})

lineReader.on('close', checkEmails)
// setTimeout(() => checkEmails, 1000)
var count = 0

function checkEmails(){
  console.log(complainedArr)
  let emailString = ''

  var lineReader2 = ReadLine.createInterface({
    input: FS.createReadStream('delivered.csv')
  })

  lineReader2.on('line', function (line) {
    if(count < 10) console.log('start', line)
    count++
    let email = getEmailFromLine(line)
      if(complainedArr.indexOf(email) == -1){
        emailString += email+",\n"
      } 
      else {
        console.log('exclude:', email)
      }
  })

  lineReader2.on('close', function(){
    console.log('count', count)
    FS.appendFile("clean.csv", emailString, function(err) {
      if(err) { return console.log(err)  }
    })
  })
}




function getEmailFromLine(line){
  var email = line.split(",")[0]
  email = email.trim()
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(re.test(email))
    return email
  else
    return null
}








// // ########################## MAILGUN ######################################
// const getMailgunSeconds = function (time) {
//   return (new Date(time).getTime()/1000).toString()
// }

// var api_key = 'key-98c5eedae6607896b14f1a9b22f1785b'
// var domain = 'mailgun.mygamebuilder.com'
// var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain})

// const logCountLimit = 100     // max 300 per request
// const startDate = getMailgunSeconds('May 6, 2017')
// getEvents(startDate)

// var counter = 0

// function parseResult(result){
//   // console.log(result)
//   let emailString = ''
//   result.items.forEach((item) => {
//     // if(item.severity == 'temporary') return false // don't log temporary fail
//     console.log(item.recipient)
//     counter++
//     emailString += item.recipient + ',\n'
//   })
//   console.log('----total count', counter)
//   // console.log('emails', emailString)
//   FS.appendFile(EVENT+".csv", emailString, function(err) {
//     if(err) { return console.log(err)  }
//   })

//   if(result.items.length > 0){
//     var recentRecipient = result.items[result.items.length-1]
//     var recentDate = recentRecipient.timestamp
//     var newDate = parseFloat(recentDate) + 0.001
//     newDate = newDate.toString()

//     setTimeout(() => getEvents(newDate), 5000)
//   }
// }

// function getEvents(date){
//   console.log('-----', date)
//   const opts = { begin: date, ascending: 'true', limit: logCountLimit, event: EVENT }
//   if(EVENT == 'failed'){
//     opts.severity = 'permanent'
//   }
//   mailgun.events().get(opts)
//   .then((result) => {
//       parseResult(result)
//     })
// }
