const cp = require('child_process')
const fs = require('fs')
const json2csv = require('json2csv')
const path = require('path')

const usage = () => {
  console.log()
  console.log('Usage: node make-csv.js <out-file>')
  console.log()
}

const [outFile] = process.argv.slice(2)

if (!outFile) {
  usage()
  process.exit(1)
}

// get absolute pats for the JSON and CSV file
const filename = path.basename(outFile, path.extname(outFile))
const dirname = path.resolve(process.cwd(), path.dirname(outFile))

const jsonFile = path.join(dirname, filename) + '.json'
const csvFile = path.join(dirname, filename) + '.csv'

//
// Export users to local JSON
//
cp.execSync([
  'mongoexport',
  '--username=mgbapp',
  '--password=tiNmhsp1',
  '--host=ds021730-a0.mlab.com:21730',
  '--db=mgb2_clus001',
  '--collection=users',
  "--query='{ isDeactivated: { $ne: true } }'",
  '--fields="username,emails"',
  '--type=json',
  '--jsonArray',
  '--pretty',
  `--out ${jsonFile}`,
].join(' '))

//
// Convert users to CSV friendly objects:
//
// INPUT {
//   "_id": "nEiE7v4YYux7zPNYD",
//   "emails": [{
//     "address": "albaraks@gmail.com",
//     "verified": false
//   }],
//   "username": "ahmed"
// }
//
// OUTPUT {
//  username: "ahmed",
//  email: "albaraks@gmail.com",
//  verified: false,
// }
const data = require(jsonFile).map(u => ({
  username: u.username,
  email: u.emails[0].address,
  verified: u.emails[0].verified,
}))

//
// Convert JSON to CSV
//
const result = json2csv({ data })

fs.writeFileSync(csvFile, result)
fs.unlinkSync(jsonFile)
