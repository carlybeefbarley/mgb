# Instructions for Building on Windows

Pre-requisites

1. Windows 10

1. Install Nodejs from https://nodejs.org/en/    We use the LTS, which at time of writing is v6.9.4 LTS

1. Install Meteor from https://www.meteor.com/install    At time of writing, this is Meteor 1.4

1. In this directory (code13/app)   run     npm install

1. Also, AS ADMINISTRATOR, run      npm install --global --production windows-build-tools

1. Check that it is working with a blank local database by running in this directory:     meteor

1. If it seems to start ok, open a browser window to   http://localhost:3000

1. To run the go.sh script which connects to the real databases, you need to add .bat to the line in the go.sh sctript that starts meteor: 

In go.sh
  meteor.bat -p 0.0.0.0:3000 $@

then run it from Powershell as...

  sh go.sh