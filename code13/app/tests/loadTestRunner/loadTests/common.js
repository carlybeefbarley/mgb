module.exports = {
  start(browser) {
    it('Loading Main Page', done => {
      browser.loadHomePage().then(() => {
        done()
      })
    })
  },
  cleanUp(browser) {
    it('Cleaning up and closing browser', done => {
      browser
        .executeScript('try{window.localStorage.clear(); window.location.reload();}catch(e){}')
        .then(() => {
          browser.close()
          browser.quit()
          done()
        })
    })
  },
}
