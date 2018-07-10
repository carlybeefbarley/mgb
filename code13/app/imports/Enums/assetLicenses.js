// These assetLicenses KEYS are used for assets.assetLicense property defined in ./assets.js

const _mkOsUrl = license => `https://opensource.org/licenses/${license}`
const _mkCcUrl = license => `https://creativecommons.org/licenses/${license}/`
const _mkCcButton = button => `https://licensebuttons.net/l/${button}`

const assetLicenses = {
  'Apache-2.0': {
    name: `Apache License 2.0`,
    url: _mkOsUrl('Apache-2.0'),
    img: null,
    tldrLegal: 'https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)',
    summary: `A short, permissive software license. A licensee can do what they like with the asset, as long as they include the required notices. This permissive license contains a patent license from the contributors of the asset.`,
  },

  'BSD-3-clause': {
    name: 'The 3-Clause BSD License',
    url: _mkOsUrl('BSD-3-Clause'),
    img: null,
    tldrLegal: 'https://tldrlegal.com/license/bsd-3-clause-license-%28revised%29',
    summary:
      'A short, permissive software license. A licensee can do whatever they want as long as they include the original copyright and license notice in any copy of the asset',
  },

  CC0: {
    name: `Creative Commons 0 PublicDomain`,
    url: 'https://creativecommons.org/share-your-work/public-domain/cc0/',
    img: 'http://i.creativecommons.org/p/zero/1.0/88x31.png',
    tldrLegal: 'https://tldrlegal.com/license/creative-commons-cc0-1.0-universal',
    summary:
      'A VERY permissive license. The copyright owner waives ALL rights and places the asset in the public domain',
  },

  'CC-BY-4.0': {
    name: `Creative Commons Attribution`,
    url: _mkCcUrl('by/4.0'),
    img: _mkCcButton('by/4.0/88x31.png'),
    tldrLegal: 'https://tldrlegal.com/license/creative-commons-attribution-4.0-international-(cc-by-4)',
    summary: `A permissive license that lets others distribute, remix, tweak, and build upon the owner's work, even commercially, as long as they credit the copyright owner for the original creation. This is the most accommodating of Creative Commons licenses offered. Recommended for maximum dissemination and use of licensed materials.`,
  },

  'CC-BY-SA-4.0': {
    name: `Creative Commons Attribution-ShareAlike 4.0 International`,
    url: _mkCcUrl('by-sa/4.0'),
    img: _mkCcButton('by-sa/4.0/88x31.png'),
    tldrLegal:
      'https://tldrlegal.com/license/creative-commons-attribution-sharealike-4.0-international-(cc-by-sa-4.0)',
    summary: `Lets others distribute, remix, tweak, and build upon the owner's work, even commercially, as long as they credit the copyright owner for the original creation and share the work under the same license.`,
  },

  'CC-BY-NC-4.0': {
    name: `Creative Commons Attribution-NonCommercial`,
    url: _mkCcUrl('by-nc/4.0'),
    img: _mkCcButton('by-nc/4.0/88x31.png'),
    tldrLegal:
      'https://tldrlegal.com/license/creative-commons-attribution-noncommercial-4.0-international-(cc-by-nc-4.0)',
    summary: `A somewhat permissive license that lets others remix, tweak, and build upon the owner's work non-commercially. Any new works must also acknowledge the original copyright owner and be non-commercial.`,
  },

  GPL3: {
    name: 'GNU General Public License v3 (GPL-3)',
    url: _mkOsUrl('gpl-3.0'),
    img: null,
    tldrLegal: 'https://tldrlegal.com/license/gnu-general-public-license-v3-%28gpl-3%29',
    summary: 'Modifications must also be made available under the GPL. Changes must be tracked',
  },

  MIT: {
    name: `The MIT License`,
    url: _mkOsUrl('MIT'),
    img: null,
    tldrLegal: 'https://tldrlegal.com/license/mit-license',
    summary: `A short, permissive software license. A licensee can do whatever they want as long as they include the original copyright and license notice in any copy of the asset`,
  },

  UNKNOWN: {
    name: `(Unknown License)`,
    url: `https://en.wikipedia.org/wiki/Wikipedia:Upload/Unknown_author_or_license`,
    img: null,
    tldrLegal: 'https://tldrlegal.com',
    summary: `The license has not yet been set. DO NOT SUBMIT COPYRIGHTED WORK WITHOUT PERMISSION.`,
  },
}

export default assetLicenses

export const defaultAssetLicense = 'MIT'
