import { RestApi, emptyPixel, etagFields, err404, assetAccessibleProps } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

// TODO: Maybe make this asset/graphic ? Look also at AssetUrlGenerator and generateUrlOptions()

// Frequently used constants:
const _cTypePng = { 'Content-Type': 'image/png' }

// Handle case where the spriteData has not yet been created
const _getAssetFrameDataUri = (partialAsset, frame = 0) => {
  if (!partialAsset) return emptyPixel

  let asset = Azzets.findOne(partialAsset._id, { fields: { 'content2.spriteData': 1 } })
  let c2 = asset.content2

  if (c2 && c2.spriteData && c2.spriteData[frame]) return c2.spriteData[frame]

  // Fallback for older assets that didn't auto-create the spriteData. This will only have layer 0 though
  // shouldn't happen anymore

  console.error(`API::graphics -> Falling back to older frameData; api/asset/png/${asset._id}`)

  asset = Azzets.findOne(partialAsset._id, { fields: { 'content2.frameData': 1 } })
  c2 = asset.content2
  if (c2 && c2.frameData && c2.frameData[frame][0]) return c2.frameData[frame][0]

  console.error(`api/asset/png/${asset._id} has no frameData or spriteDate for frame #${frame}`)
  return emptyPixel
}

RestApi.addRoute(
  'asset/png/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      return genAPIreturn(
        this,
        asset,
        partialAsset => {
          const dataUri = _getAssetFrameDataUri(partialAsset, this.queryParams.frame)
          return dataUri ? dataUriToBuffer(dataUri) : null
        },
        _cTypePng,
      )
    },
  },
)

RestApi.addRoute(
  'asset/png/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            kind: 'graphic',
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return genAPIreturn(
        this,
        asset,
        partialAsset => {
          const dataUri = _getAssetFrameDataUri(partialAsset, this.queryParams.frame)
          return dataUri ? dataUriToBuffer(dataUri) : null
        },
        _cTypePng,
      )
    },
  },
)

RestApi.addRoute(
  'asset/fullgraphic/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            kind: 'graphic',
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return genAPIreturn(this, asset, partialAsset => {
        return Azzets.findOne(partialAsset._id)
      })
    },
  },
)

RestApi.addRoute(
  'asset/tileset-info/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      /* Example...
      firstgid:    1
      image:       "main.png"
      imageheight: 100
      imagewidth:  256
      margin:      0
      name:        "main"
      spacing:     0
      tilecount:   4
      tileheight:  100
      tiles:       Object
      tilewidth:   64
     */

      return genAPIreturn(this, asset, partialAsset => {
        const asset = Azzets.findOne(partialAsset._id, {
          fields: {
            dn_ownerName: 1,
            name: 1,
            'content2.frameData': 1,
            'content2.animations': 1,
            'content2.rows': 1,
            'content2.cols': 1,
            'content2.width': 1,
            'content2.height': 1,
          },
        })

        const c2 = asset.content2
        const tilecount = c2.frameData ? c2.frameData.length : 1
        const tiles = {}
        c2.animations &&
          c2.animations.forEach(anim => {
            const animation = []
            const duration = 1000 / anim.fps // round?
            anim.frames.forEach(frame => {
              animation.push({
                duration,
                tileid: frame,
              })
            })
            tiles[anim.frames[0]] = {
              animation,
              mgb_animation_info: {
                name: anim.name,
                fps: anim.fps,
              },
            }
          })

        return {
          image: '/api/asset/tileset/' + asset.dn_ownerName + '/' + asset.name,
          // don't do that - as image will be cached forever and embedded in the map (phaser don't know how to extract embedded images automatically)
          //image: c2.tileset ? c2.tileset : "/api/asset/tileset/" + this.urlParams.id,
          name: asset.name,
          imageheight: c2.rows ? c2.rows * c2.height : c2.height,
          imagewidth: c2.cols ? c2.cols * c2.width : c2.width * tilecount,
          tilecount,
          tileheight: c2.height,
          tilewidth: c2.width,
          tiles,
        }
      })
    },
  },
)

RestApi.addRoute(
  'asset/tileset/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      return genAPIreturn(
        this,
        asset,
        partialAsset => {
          const asset = Azzets.findOne(partialAsset._id, {
            fields: {
              'content2.tileset': 1,
            },
          })
          if (!asset || !asset.content2) return err404

          const dataUri =
            asset.content2.tileset || _getAssetFrameDataUri(partialAsset, this.queryParams.frame)
          return dataUri ? dataUriToBuffer(dataUri) : null
        },
        _cTypePng,
      )
    },
  },
)

RestApi.addRoute(
  'asset/tileset/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
            kind: 'graphic',
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return genAPIreturn(
        this,
        asset,
        partialAsset => {
          const asset = Azzets.findOne(partialAsset._id, {
            fields: {
              'content2.tileset': 1,
            },
          })
          if (!asset || !asset.content2) return err404

          const dataUri =
            asset.content2.tileset || _getAssetFrameDataUri(partialAsset, this.queryParams.frame)
          return dataUri ? dataUriToBuffer(dataUri) : null
        },
        _cTypePng,
      )
    },
  },
)
