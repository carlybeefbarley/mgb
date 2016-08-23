const webdriver = require('selenium-webdriver');
const browser = require("./browser")({}, 'http://127.0.0.1:4444/wd/hub');
//const tests = require('./tests')


//browser.get("http://v2.mygamebuilder.com/");
browser
  .url('http://www.google.com')
  .waitForElementVisible('body', 1000)
  .setValue('input[type=text]', 'nightwatch')
  .waitForElementVisible('button[name=btnG]', 1000)
console.log("all done!");
