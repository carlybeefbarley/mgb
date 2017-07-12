// !!! ATM phantomjs is not working with selenium 3.1.X .. 3.3.X is fine again

// selenium server
this.server = 'http://127.0.0.1:4444/wd/hub'
// url to open
// this.url = "http://v2.mygamebuilder.com"
this.url = 'http://localhost:3000'

this.browser = {
  browserName: 'phantomjs',
}
