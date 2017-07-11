const mgb1 = {
  getUserAvatarUrl: mgb1name => `https://s3.amazonaws.com/JGI_test1/${mgb1name}/project1/tile/avatar`,
  getEditPageUrl: mgb1name => `http://s3.amazonaws.com/apphost/MGB.html#user=${mgb1name};project=project1`,
}

export default mgb1
