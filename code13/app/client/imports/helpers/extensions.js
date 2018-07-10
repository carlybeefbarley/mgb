const knownExts = { css: true }

/**
 * Return extension of the name
 * @param name - asset name
 * @returns {string}
 */
const getExtension = (name = '') => {
  return name.substring(name.lastIndexOf('.') + 1)
}
/**
 * return true if extension is known
 * @param name - name of the asset
 * @returns {bool}
 */
const isKnownExtension = name => {
  const ext = getExtension(name)
  return knownExts[ext]
}
/**
 * return extension if extension is known otherwise defaultName (empty string by default)
 * @param name - name of the asset
 * @param {String} [defaultName=] - default name to return
 * @returns {String}
 */
const getKnownExtension = (name, defaultName = '') => {
  const ext = getExtension(name)
  return knownExts[ext] ? ext : defaultName
}

export { getKnownExtension, isKnownExtension, getExtension, knownExts }
