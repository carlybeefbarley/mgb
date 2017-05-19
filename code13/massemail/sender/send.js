var FS = require('fs')
var ReadLine = require('readline')
var InfiniteLoop = require('infinite-loop')

var lineReader = ReadLine.createInterface({
  input: FS.createReadStream('emails.csv')
})



var intervalMs = 10000  // miliseconts to send next email
var splitTime = Date.now() - intervalMs + 1000 // start sending in one second from script start
var startLineNr = 0     // line number from csv to start send
var counter = 0         // leave as 0. counts sent emails
var totalLineCount = 6*60*24  // lines to send. On purpose
var emailArr = []

// read csv file line by line and add emails to array
var count = 0
lineReader.on('line', function (line) {
  count++
  if(count >= startLineNr && count < startLineNr+totalLineCount){
    var email = getEmailFromLine(line)
    if(email){
      emailArr.push(email)
    }
  }
})

console.log('Start sending emails')


// infinite loop construction
var emailNr = 0
var infiniteLoop = new InfiniteLoop()
function loop() {
  if(splitTime + intervalMs <= Date.now() && emailNr<emailArr.length){
    sendMailgun(emailArr[emailNr])
    splitTime += intervalMs
    emailNr++
  }
}
infiniteLoop.add(loop).run()


// check if email exists in csv line and returns it
function getEmailFromLine(line){
  var email = line.split(",")[1]
  email = email.trim()
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(re.test(email))
    return email
  else
    return null
}



// ########################## MAILGUN ######################################

var api_key = 'key-98c5eedae6607896b14f1a9b22f1785b';
var domain = 'mailgun.mygamebuilder.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

function sendMailgun(email){
  var data = {
    from: 'MyGameBuilder Team <info@mygamebuilder.com>',
    to: email,
    // to: "guntis.smaukstelis@gmail.com",
    subject: 'MyGameBuilder is back!',
    'o:tag': 'Verified old MGB',
    html: '<p>Hello there, we are launching a new version of My Game Builder, and we are inviting our members from first version to experience it.</p><p>It is fully compatible with your games from the original MGB and we are importing those projects this week! Plus new MGB allows for real coding and teamwork collboration. </p><p>Please come and try it out. <a href="https://landing.mygamebuilder.com"><b>https://landing.mygamebuilder.com</b></a></p><p>&mdash; The MyGameBuilder Team</p><br/><br/><br/><br/>'
  }
  
  console.log(startLineNr + counter, email)
  counter++
  mailgun.messages().send(data, function (error, body) {
    // log answer from mailgun if everything is ok
    console.log(body)
  })
}