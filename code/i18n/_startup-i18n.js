

if (Meteor.isClient)
{
  Meteor.startup( () => {

    function getLang() {
      if (navigator.languages != undefined)  {
        return navigator.languages[0];
      }
      return navigator.language || navigator.browserLanguage;
    }

    let thisLocale = getLang();   // TODO:allow the user to override
    console.log("Setting locale automatically to " + thisLocale);
    _i18n.setLocale(thisLocale);

    T = _i18n.createComponent();      // Expprting as global intentionally.. T is for Translate

    i18n = _i18n;                     // Exporting as global intentionally..
  })
}
else
{
  // TODO - for server side you should read it from header 'accept-language'.
  // See https://github.com/vazco/meteor-universe-i18n/#settinggetting-locale
}
