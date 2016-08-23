module.exports = {
  'Login': ''+function (client) {
    // TODO: move all important button selectors to external file for reuse?
    // TODO: login will be required all the time.. should it be first test always??
    const sidePanelButton = '.mgbNavPanel .ui.inverted.icon.menu .item .user';
    const loginButton = 'a[href="/signin"]';
    // TODO: on error collect console logs
    client
      .url("http://v2.mygamebuilder.com/")
      .useCss()
      // first loading might take more
      .waitForElementVisible(sidePanelButton, 5000)
      .click(sidePanelButton)
      .waitForElementVisible(loginButton, 1000)
      .click(loginButton)
      .click(".ui.input[data-name='email']")
      .setValue(".ui.input[data-name='email']", 'tester@example.com')
      .click(".ui.input[data-name='password']")
      .setValue(".ui.input[data-name='password']", ['tester1', client.Keys.ENTER])
    //TODO: how to tell if user has been logged in?
      .saveScreenshot('screen.png')

  },
  // example how to get log
  'Log': ''+function(client){
    client
      .url("http://127.0.0.1:8000/")
      .waitForElementVisible("body", 5000)
      .execute(function(){
        console.error("I'm alive!");
      }, (done) => {
        console.log("Exec done", done)
      })
      .getLog('browser', function(result) {
        console.log(result);
      })
  },
  // disabled
  'other sample test': '' + function (client) {
    // test code
  }
};
