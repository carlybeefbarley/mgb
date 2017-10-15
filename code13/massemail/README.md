# Mass Email

This app contains scripts and tools for sending mass emails.

- `sender/` - sends emails to list of email addresses
- `cleaner/` - cleans unsubscribed emails from delivered email list
- `logs/` - parse log file and get delivered, rejected, unsubscribet etc emails
- `scripts/` - get emails from mgb actual user database

## sender/ Sends emails
Reads emails.csv file and sends email each 10 seconds. 
This has to be done to ensure that email servers keep us in whitelist. 
They don't like huge chunks at a time

cd sender/
node send.js

If script stopped for some reason then there are startLineNr param which defines from what line (in csv file) start sending

Note that we pass `o:tag` param to Mailgun data. It defines campaign name 

## cleaner/ Cleans unsubscribed email

cd cleaner/
node cleaner.js

There has to be two files in folder `unsubscribed.csv` and `delivered.csv`
Cleaner reads unsubscribed emails, finds email in delivered.csv and deletes one if found

## logs/ separate log files to delivered, rejected, unsubscribed ...

cd logs/
node getLogs.js

Note that you have to specify event you want log about in line 14 `const EVENT`
There are 7 different events

const EVENT_FAILED        = 'failed'
const EVENT_REJECTED      = 'rejected'
const EVENT_COMPLAINED    = 'complained'
const EVENT_UNSUBSCRIBED  = 'unsubscribed'
const EVENT_DELIVERED     = 'delivered'
const EVENT_OPENED        = 'opened'
const EVENT_CLICKED       = 'clicked'

## Generate CSV of usernames and emails

Make a one off CSV of usernames and emails in the current production database.  Saves to `data/users.csv`.

    # first start the app
    cd ../app
    yarn start

    # come back and export create the CSV
    cd ../massemail
    yarn make-csv

>This is unrelated to the `sender/emails.csv` and the send script.
