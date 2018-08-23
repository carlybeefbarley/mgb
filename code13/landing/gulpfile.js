const del = require('del')
const gulpLoadPlugins = require('gulp-load-plugins')
const gulp = require('gulp')
const runSequence = require('run-sequence')
const g = gulpLoadPlugins(gulp)
const through2 = require('through2')
const cheerio = require('cheerio')
const fs = require('fs-extra')

// ============================================================
// Config
// ============================================================

const DEFAULT_ENV = {
  MGB_LANDING_BASE_URL: '/',
  MGB_APP_URL: 'https://v2.mygamebuilder.com/',
  MGB_APP_CDN_URL: 'https://d1d15nbexzn633.cloudfront.net/',
}

process.env = Object.assign({}, DEFAULT_ENV, process.env)

const makePath = (...paths) => paths.join('/').replace(/\/\//g, '/')
const srcPath = (...paths) => makePath('src', ...paths)
const distPath = (...paths) => makePath('dist', ...paths)
const cdnPath = (...paths) => makePath('cdn', ...paths)
const meteorBuildPath = (...paths) => makePath('../app/.meteor/local/build/programs/web.browser/', ...paths)

const paths = {
  fonts: {
    src: meteorBuildPath('app/fonts/semantic-ui/icons.*'),
    dest: distPath('fonts/semantic-ui'),
  },
  html: {
    src: srcPath('**/*.html'),
    dest: distPath(),
  },
  images: {
    src: srcPath('**/*.{jpg,png,gif,webm}'),
    dest: distPath(),
  },
  js: {
    src: srcPath('js/**/*.js'),
    dest: distPath('js'),
  },
  styles: {
    src: srcPath('styles/main.less'),
    dest: distPath('styles'),
    watch: srcPath('styles/**/*.less'),
  },
}

const autoprefixerOpts = {
  browsers: ['last 2 versions'],
}

const uglifyOpts = {
  mangle: true,             // false - skip mangling names
  output: {},               // object - specify additional output options. defaults to best compression.
  compress: true,           // object - specify custom compressor options. Pass false to skip compression completely.
  preserveComments: false,  // A convenience option for options.output.comments. Defaults to preserving no comments.
                            //   all        : Preserve all comments in code blocks
                            //   license    : Attempts to preserve comments. Implemented via uglify-save-license.
                            //   function   : Specify your own comment preservation function.
}

// ============================================================
// Custom Plugins
// ============================================================
// Takes an HTML file and copies all the referenced assets from the meteor build
const copyUsedMeteorAssets = () => through2.obj(function(file, enc, cb) {
  const html = file.contents.toString()
  const $ = cheerio.load(html)

  const attrs = ['src', 'href', 'content']
  const assetPaths = []

  attrs.forEach(attr => {
    $(`[${attr}*="~"]`).each((i, node) => {
      const $node = $(node)
      const value = $node.attr(attr)

      // https://host.com/path/~/app/images/borrowed.jpg
      // ^-------prefix-------^ ^-------buildPath------^
      //                       ^
      //              MGB_LANDING_BASE_URL
      const [prefix, buildPath] = /^(.*?)~(.*)$/.exec(value).slice(1)

      // copied assets are served at the base url + the original build path
      const publicPath = [process.env.MGB_LANDING_BASE_URL, buildPath]
        .filter(Boolean)          // remove falsey
        .join('')                 // make a string
        .replace(/\/\/+/g, '/')   // replace all "//" with "/"

      // replace the node attribute with the prefix + public path
      $node.attr(attr, prefix + publicPath)
      assetPaths.push(buildPath)
    })
  })

  assetPaths.forEach((assetPath) => {
    const imgPath = meteorBuildPath(assetPath)
    const dest = distPath(assetPath)
    try {
      fs.copySync(imgPath, dest)
      g.util.log('Copied!', g.util.colors.magenta(assetPath))
    } catch (err) {
      err.message = g.util.colors.red(`Could not copy asset "${assetPath}".\n`) + err.message
      this.emit('error', err)
    }
  })

  file.contents = Buffer.from($.html())

  cb(null, file)
})

// Replaces ${VAR} syntax with values from system environment variables
const interpolateEnvVars = () => through2.obj(function(file, enc, cb) {
  const contents = file.contents.toString()
  const interpolated = contents.replace(/\{\{(.*?)\}\}/g, (match, p1) => process.env[p1.trim()])

  file.contents = Buffer.from(interpolated)

  cb(null, file)
})

// ============================================================
// Tasks
// ============================================================

// ----------------------------------------
// Publish
// ----------------------------------------
gulp.task('publish', (cb) => {
  runSequence(
    'clean',
    'build',
    'publish:make-cdn-files',
    'publish:aws',
    cb
  )
})

gulp.task('publish:aws', function() {
  const {
    AWS_S3_BUCKET_NAME,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_CLOUDFRONT_DISTRIBUTION_ID,
  } = process.env

  if (!AWS_S3_BUCKET_NAME)
    throw new Error('Missing AWS_S3_BUCKET_NAME env var, see README.md')

  if (!AWS_ACCESS_KEY_ID)
    throw new Error('Missing AWS_ACCESS_KEY_ID env var, see README.md')

  if (!AWS_SECRET_ACCESS_KEY)
    throw new Error('Missing AWS_SECRET_ACCESS_KEY env var, see README.md')

  if (!AWS_CLOUDFRONT_DISTRIBUTION_ID)
    throw new Error('Missing AWS_CLOUDFRONT_DISTRIBUTION_ID env var, see README.md')

  const aws = {
    params: {
      Bucket: AWS_S3_BUCKET_NAME,
    },
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    distributionId: AWS_CLOUDFRONT_DISTRIBUTION_ID,
    region: 'us-east-1',
  }

  const publisher = g.awspublish.create(aws)
  const headers = { 'Cache-Control': 'max-age=315360000, no-transform, public' }

  const isValidCloudFrontFile = file => {
    const isDeleted = file.s3 && file.s3.state && file.s3.state.deleted
    const hasPath = !!file.path
    return hasPath && !isDeleted
  }

  return gulp
    .src(cdnPath('**'))
    // don't gzip videos, S3 doesn't serve them with the right encoding headers by default
    // this is a shortcut since we'll be moving all videos to youtube anyway
    .pipe(g.if(file => !/.*\.webm$/.test(file.path), g.awspublish.gzip()))
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(publisher.cache())
    .pipe(g.awspublish.reporter())
    // Heads up!
    // gulp-cloudfront doesn't play nicely with files deleted by publisher.sync()
    // Make sure all files passed to cloudfront aren't deleted
    // https://github.com/smysnk/gulp-cloudfront/issues/6
    .pipe(g.if(isValidCloudFrontFile, g.cloudfront(aws)))
})

gulp.task('publish:make-cdn-files', () => {
  const {
    MGB_LANDING_BASE_URL,
    MGB_LANDING_HOST,
  } = process.env

  if (!MGB_LANDING_BASE_URL)
    throw new Error('Missing MGB_LANDING_BASE_URL env var, see README.md')

  if (!MGB_LANDING_HOST)
    throw new Error('Missing MGB_LANDING_HOST env var, see README.md')

  return gulp
    .src(distPath('**'))
    // gulp-rev-all version hash depends on file order
    // the gulp src stream doesn't guarantee order
    // sort the files for deterministic hashing
    // otherwise, when running consecutive deploys only the final deploy points to valid s3 objects
    // https://github.com/smysnk/gulp-rev-all/issues/155
    .pipe(g.sort())
    // meta og:image tags require absolute urls
    // rev-all by default does not update versioned asset names in absolute urls
    // instead, we prefix all asset urls with the absolute urls and use a relative url for og:image
    // this results in all assets having the correct absolute url
    .pipe(g.revAll.revision({
      prefix: 'https://' + [MGB_LANDING_HOST, MGB_LANDING_BASE_URL]
        .filter(Boolean)
        .join('')
        .replace(/\/\/+/g, '/'),
    }))
    .pipe(gulp.dest(cdnPath()))
})

// ----------------------------------------
// Serve
// ----------------------------------------
gulp.task('serve', () => {
  g.connect.server({
    host: '0.0.0.0',
    root: distPath(),
    livereload: true,
  })
})

// ----------------------------------------
// Clean
// ----------------------------------------
gulp.task('clean', (cb) => {
  del.sync(cdnPath())
  del.sync(distPath())
  cb()
})

// ----------------------------------------
// Build
// ----------------------------------------
gulp.task('build', (cb) => {
  runSequence(
    [
      'build:fonts',
      'build:html',
      'build:images',
      'build:js',
      'build:styles',
    ],
    cb
  )
})

gulp.task('build:fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(g.plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(g.connect.reload())
})

gulp.task('build:html', () => {
  return gulp.src(paths.html.src)
    .pipe(g.plumber())
    .pipe(copyUsedMeteorAssets())
    .pipe(interpolateEnvVars())
    .pipe(g.htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(g.connect.reload())
})

gulp.task('build:images', () => {
  return gulp.src(paths.images.src)
    .pipe(g.plumber())
    .pipe(g.imagemin())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(g.connect.reload())
})

gulp.task('build:js', () => {
  return gulp.src(paths.js.src)
    .pipe(g.plumber())
    .pipe(interpolateEnvVars())
    .pipe(g.uglify(uglifyOpts))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(g.connect.reload())
})

gulp.task('build:styles', () => {
  return gulp.src(paths.styles.src)
    .pipe(g.plumber())
    .pipe(interpolateEnvVars())
    .pipe(g.less())
    .pipe(g.autoprefixer(autoprefixerOpts))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(g.connect.reload())
})

// ----------------------------------------
// Watch
// ----------------------------------------
gulp.task('watch', (cb) => {
  gulp.watch([paths.fonts.watch || paths.fonts.src], ['build:fonts'])
  gulp.watch([paths.html.watch || paths.html.src], ['build:html'])
  gulp.watch([paths.images.watch || paths.images.src], ['build:images'])
  gulp.watch([paths.js.watch || paths.js.src], ['build:js'])
  gulp.watch([paths.styles.watch || paths.styles.src], ['build:styles'])
  cb()
})

// ----------------------------------------
// Default
// ----------------------------------------
gulp.task('default', cb => {
  runSequence(
    'clean',
    [
      'build',
      'watch',
      'serve',
    ],
    cb
  )
})
