// These assetLicenses KEYS are used for assets.assetLicense property defined in ./assets.js


const _mkOsUrl = license => `https://opensource.org/licenses/${license}` 
const _mkCcUrl =    license => `https://creativecommons.org/licenses/${license}/` 
const _mkCcButton = button  => `https://licensebuttons.net/l/${button}`

export default assetLicenses = 
{
  'MIT': { 
    name: `The MIT License`,
    url:  _mkOsUrl('MIT'), 
    img:  null,
    tldrLegal: 'https://tldrlegal.com/license/mit-license',
    summary: `A short, permissive software license. Basically, you can do whatever you want as long as you include the original copyright and license notice in any copy of the software/source`
  },

  'Apache-2.0': { 
    name: `Apache License 2.0`,
    url:  _mkOsUrl('Apache-2.0'),
    img:  null,
    tldrLegal: 'https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)',
    summary: `You can do what you like with the software, as long as you include the required notices. This permissive license contains a patent license from the contributors of the code.`
  },

  'CC0': { 
    name: `Creative Commons 0 PublicDomain`,
    url:  'https://creativecommons.org/share-your-work/public-domain/cc0/',
    img:  'http://i.creativecommons.org/p/zero/1.0/88x31.png',
    tldrLegal: 'https://tldrlegal.com/license/creative-commons-cc0-1.0-universal',
    summary: 'Waive ALL rights and place your work in the public domain'
  },

  'CC-BY-4.0': { 
    name: `Creative Commons Attribution (CC BY)`,
    url:  _mkCcUrl('by/4.0'),
    img:  _mkCcButton('by/4.0/88x31.png'),
    tldrLegal: 'https://tldrlegal.com/license/creative-commons-attribution-4.0-international-(cc-by-4)',
    summary: `This license lets others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.`
  },

  'CC-BY-NC-4.0': { 
    name: `Creative Commons Attribution-NonCommercial (CC BY-NC)`,
    url:  _mkCcUrl('by-nc/4.0'),
    img:  _mkCcButton('by-nc/4.0/88x31.png'),
    tldrLegal: 'https://tldrlegal.com/license/creative-commons-attribution-noncommercial-4.0-international-(cc-by-nc-4.0)',
    summary: `This license lets others remix, tweak, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to license their derivative works on the same terms.`
  }
}

export const defaultAssetLicense = 'MIT'