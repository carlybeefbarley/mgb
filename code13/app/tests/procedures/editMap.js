const SeleniumHelper = require('../helpers/selenium.js')

const el = {
  tilesetDropArea: '#mgb_map_tileset_drop_area',
  tilesetCanvas: '#mgb_map_tileset_canvas',
  mapArea: '#mgb_map_area',
}
module.exports = browser => {
  const sel = SeleniumHelper(browser)
  const selectTile = (id, tileWidth = 32, tileHeight = 32) => {
    const ts = sel.css(el.tilesetCanvas)
    return ts.getSize().then(size => {
      const widthInTiles = Math.floor(size.width / tileWidth)
      const tx = id % widthInTiles
      const ty = Math.floor(id / widthInTiles)
      const pos = { x: (tx + 0.5) * tileWidth, y: (ty + 0.5) * tileHeight }
      //console.log("SELECTING: ", pos)
      browser
        .actions()
        .mouseMove(ts, pos)
        .click()
        .perform()
    })
  }

  const putTileOnMap = (x, y, tileWidth = 32, tileHeight = 32) => {
    const map = sel.css(el.mapArea)
    const loc = { x: (x + 0.5) * tileWidth, y: (y + 0.5) * tileHeight }
    browser
      .actions()
      .mouseMove(map, loc)
      .click()
      .perform()
  }

  return done => {
    sel.adjustLevelSlider()

    const tileset = sel.css(el.tilesetDropArea)
    const asset = sel.findAsset('test.image.for.tileset')
    sel.dragAndDrop(asset, tileset)
    // wait until tileset gets loaded
    sel.untilInvisible(el.tilesetCanvas + '.empty')
    // these could be skipped - but tileset is not drawn yet - and user would wait until it appears
    sel.untilInvisible('.loading')
    // sel.waitUntilSaved() - user wouldn't wait 5 seconds to start putting tiles on the map

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        selectTile((x + y) % 4, 32, 32).then(() => {
          putTileOnMap(x, y)
        })
      }
    }
    sel.untilInvisible('.loading')
    sel.waitUntilSaved()
    browser
      .executeScript(
        `
    return window.m.editMap.getImageData()`,
      )
      .then(pngData => {
        sel.compareImages('simple.map.thumbnail.pngdata.txt', pngData)
      })

    sel.done(done)
  }
}
