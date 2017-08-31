# Mass Email

This app contains scripts and tools for sending mass emails.

## Generate CSV of usernames and emails

Make a one off CSV of usernames and emails in `data/users.csv`.

    # first start the app
    cd ../app
    yarn start

    # come back and export create the CSV
    cd ../massemail
    yarn make-csv

>This is unrelated to the `sender/emails.csv` and the send script.

## Send emails to users/emails in `sender/emails.csv`

See `sender/emails.csv` for the addresses that will be used.  These appear to be from MGB v1.

    yarn send

## Get mailgun logs

    yarn get-logs
