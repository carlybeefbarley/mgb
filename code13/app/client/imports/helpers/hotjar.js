import { isUserSuperAdmin } from '/imports/schemas/roles'

export default Hotjar = (action, codeSnippet, currUser) => {
  // console.log('superAdmin', isUserSuperAdmin(currUser))
  
  // don't send hotjar heatmap if superadmin or localhost
  if(!isUserSuperAdmin(currUser) && location.hostname != 'localhost'){
    hj(action, codeSnippet)
  }
}

export const InitHotjar = (currUser) => {
  if(!isUserSuperAdmin(currUser) && location.hostname != 'localhost'){

    // h._hjSettings={hjid:446876,hjsv:5,hjdebug:true};
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:446876,hjsv:5,hjdebug:true};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
  }
} 