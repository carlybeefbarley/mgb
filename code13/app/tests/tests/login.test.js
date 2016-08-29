/* this is sample test which only tries to log in user */
module.exports = (browser, path) => {
  const login = require(path + "procedures/login.js")(browser)
  it("Logging in", login)
}
