/* this is sample test which logs in user */
module.exports = (browser, path, done) => {
  const login = require(path + "procedures/login.js")(browser)
  it("Logging in", login)
}
