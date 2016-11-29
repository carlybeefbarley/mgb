const SeleniumHelper = require("../helpers/selenium.js")

const el = {
  tilesetDropArea: "#mgb_map_tileset_drop_area",
  tilesetCanvas: "#mgb_map_tileset_canvas",
  mapArea: "#mgb_map_area"
}
module.exports = (browser) => {
  const sel = SeleniumHelper(browser)
  const selectTile = (id, tileWidth = 32, tileHeight = 32) => {
    const ts = sel.css(el.tilesetCanvas)
    return ts.getSize().then(size => {
      const widthInTiles = Math.floor(size.width / tileWidth)
      const tx = id % widthInTiles
      const ty = Math.floor(id / widthInTiles)
      const pos = {x: (tx + 0.5) * tileWidth, y: (ty + 0.5) * tileHeight}
      console.log("Selected tile: ", id, pos, "size:", size)
      browser.actions()
        .mouseMove(ts, pos)
        .click()
        .perform()
    })
  }

  const putTileOnMap = (x, y, tileWidth = 32, tileHeight = 32) => {
    const map = sel.css(el.mapArea)
    browser.actions()
      .mouseMove(map, {x: x * tileWidth, y: y * tileHeight})
      .click()
      .perform()
  }

  return (done) => {
    sel.adjustLevelSlider()

    const tileset = sel.css(el.tilesetDropArea)
    const asset = sel.findAsset("test.image.for.tileset")
    sel.dragAndDrop(asset, tileset)
    // wait until tileset gets loaded
    sel.untilInvisible(el.tilesetCanvas + ".empty")
    // these could be skipped - but tileset is not drawn yet
    sel.untilInvisible(".loading")
    sel.waitUntilSaved()

    for(let y=0; y<4; y++){
      for(let x =0; x<4; x++){
        selectTile((x + y) % 4)
          .then(() => {
            putTileOnMap(x, y)
          })
      }
    }

    sel.waitUntilSaved()
    sel.done(done)
  }
}
