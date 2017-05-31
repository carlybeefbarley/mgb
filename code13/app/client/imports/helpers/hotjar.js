import { isUserSuperAdmin } from '/imports/schemas/roles'

export default Hotjar = (action, codeSnippet, currUser) => {
  // console.log('superAdmin', isUserSuperAdmin(currUser))
  
  // don't send hotjar heatmap if superadmin or localhost
  if(!isUserSuperAdmin(currUser) && location.hostname != 'localhost'){
    hj(action, codeSnippet)
  }
}