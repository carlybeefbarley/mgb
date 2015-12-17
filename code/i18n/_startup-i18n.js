
//System.import('{universe:i18n}').then( (mod) => i18n = mod.i18n);  // This is the pre-ecmascript2015 syntax
import i18n from '{universe:i18n}';


if (Meteor.isClient)
{
  Meteor.startup( () => {

    function getLang() {
      if (navigator.languages != undefined)  {
        return navigator.languages[0];
      }
      return navigator.language || navigator.browserLanguage;
    }

    let thisLocale = "es";//getLang();   // TODO:allow the user to override
    console.log("Setting locale automatically to " + thisLocale);
    i18n.setLocale(thisLocale);

    T = i18n.createComponent();         // Expprting as global intentionally.. T is for Translate

   // i18n = _i18n;                     // Exporting as global intentionally..
  })
}
else
{
  // TODO - for server side you should read it from header 'accept-language'.
  // See https://github.com/vazco/meteor-universe-i18n/#settinggetting-locale
}
