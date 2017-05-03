const del = require( 'del' )
const gulpLoadPlugins = require( 'gulp-load-plugins' )
const gulp = require( 'gulp' )
const runSequence = require( 'run-sequence' )
const g = gulpLoadPlugins( gulp )
const through2 = require( 'through2' )
const cheerio = require( 'cheerio' )
const fs = require( 'fs-extra' )


var RevAll = require('gulp-rev-all');
var awspublish = require('gulp-awspublish');
var cloudfront = require("gulp-cloudfront");
 


// ============================================================
// Config
// ============================================================
process.env.BASE_URL = process.env.BASE_URL || ''
process.env.MGB_URL = process.env.MGB_URL || 'https://v2.mygamebuilder.com/'

const makePath = (...paths) => paths.join( '/' ).replace( /\/\//g, '/' )
const srcPath = (...paths) => makePath( 'src', ...paths )
const distPath = (...paths) => makePath( 'dist', ...paths )
const meteorBuildPath = (...paths) => makePath( '../app/.meteor/local/build/programs/web.browser', ...paths )

const paths = {
  fonts:  {
    src:  meteorBuildPath( 'app/lib/semantic-ui/src/themes/default/assets/fonts/icons.*' ),
    dest: distPath( 'lib/semantic-ui/src/themes/default/assets/fonts' ),
  },
  html:   {
    src:  srcPath( '**/*.html' ),
    dest: distPath(),
  },
  images: {
    src:  srcPath( '**/*.{jpg,png,gif}' ),
    dest: distPath(),
  },
  js:     {
    src:  srcPath( 'js/**/*.js' ),
    dest: distPath( 'js' ),
  },
  styles: {
    src:   srcPath( 'styles/main.less' ),
    dest:  distPath( 'styles' ),
    watch: srcPath( 'styles/**/*.less' ),
  }
}

const autoprefixerOpts = {
  browsers: ['last 2 versions'],
}

const uglifyOpts = {
  mangle:           true,     // false - skip mangling names
  output:           {},       // object - specify additional output options. defaults to best compression.
  compress:         true,     // object - specify custom compressor options. Pass false to skip compression completely.
  preserveComments: false,    // A convenience option for options.output.comments. Defaults to preserving no comments.
                              //   all        : Preserve all comments in code blocks
                              //   license    : Attempts to preserve comments. Implemented via uglify-save-license.
                              //   function   : Specify your own comment preservation function.
}


const aws = {
  "params": {
    "Bucket": process.env.AWS_S3_LANDINGPAGE_BUCKETNAME || "landing.mygamebuilder.com"
  },
  "accessKeyId":     "",           // Caller should provide this in ENV: AWS_ACCESS_KEY_ID="shhhhh"
  "secretAccessKey": "",           // Caller should provide this in ENV: AWS_SECRET_ACCESS_KEY="shhhhh"
  "distributionId": process.env.AWS_S3_LANDINGPAGE_CLOUDFRONT_DISTRIBUTIONID || "E2FKDU47P960M9",
  "region": "us-east-1",
};
 
const publisher = awspublish.create(aws);
const headers = {'Cache-Control': 'max-age=315360000, no-transform, public'};


// ============================================================
// Custom Plugins
// ============================================================
// Takes an HTML file and copies all the referenced assets from the meteor build
const copyUsedMeteorAssets = () => through2.obj( function (file) {
  const html = file.contents.toString()
  const $ = cheerio.load( html )

  const attrs = ['src', 'href']
  const assetPaths = []

  attrs.forEach( attr => {
    $( `[${attr}^="~"]` ).each( (i, node) => {
      const $node = $( node )
      const value = $node.attr( attr )
      const buildPath = value.replace( '~', '' )
      $node.attr( attr, (process.env.BASE_URL + buildPath ).replace( /\/\//g, '/' ) )
      assetPaths.push( buildPath )
    } )
  } )

  assetPaths.forEach( (assetPath) => {
    const imgPath = meteorBuildPath( assetPath )
    const dest = distPath( assetPath )
    try {
      fs.copySync( imgPath, dest )
      g.util.log( 'Copied!', g.util.colors.magenta( assetPath ) )
    } catch (err) {
      err.message = g.util.colors.red( `Could not copy asset "${assetPath}".\n` ) + err.message
      this.emit( 'error', err )
    }
  } )

  file.contents = Buffer.from( $.html() )

  this.push( file )
} )

// Replaces ${VAR} syntax with values from system environment variables
const interpolateEnvVars = () => through2.obj( function (file) {
  const contents = file.contents.toString()
  const interpolated = contents.replace( /\{\{(.*?)\}\}/g, (match, p1) => process.env[p1.trim()] )

  file.contents = Buffer.from( interpolated )

  this.push( file )
} )

// ============================================================
// Tasks
// ============================================================


gulp.task('awspublish', function () {
 
  gulp
    .src('dist/**')
    .pipe(RevAll.revision())
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
    .pipe(cloudfront(aws));
 
});


// ----------------------------------------
// Serve
// ----------------------------------------
gulp.task( 'serve', () => {
  g.connect.server( {
    root:       distPath(),
    livereload: true
  } )
} )

// ----------------------------------------
// Clean
// ----------------------------------------
gulp.task( 'clean', (cb) => {
  del.sync( distPath() )
  cb()
} )

// ----------------------------------------
// Build
// ----------------------------------------
gulp.task( 'build', (cb) => {
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
} )

gulp.task( 'build:fonts', () => {
  gulp.src( paths.fonts.src )
    .pipe( g.plumber() )
    .pipe( gulp.dest( paths.fonts.dest ) )
    .pipe( g.connect.reload() )
} )

gulp.task( 'build:html', () => {
  gulp.src( paths.html.src )
    .pipe( g.plumber() )
    .pipe( copyUsedMeteorAssets() )
    .pipe( interpolateEnvVars() )
    .pipe( g.htmlmin( { collapseWhitespace: true } ) )
    .pipe( gulp.dest( paths.html.dest ) )
    .pipe( g.connect.reload() )
} )

gulp.task( 'build:images', () => {
  gulp.src( paths.images.src )
    .pipe( g.plumber() )
    .pipe( g.imagemin() )
    .pipe( gulp.dest( paths.images.dest ) )
    .pipe( g.connect.reload() )
} )

gulp.task( 'build:js', () => {
  gulp.src( paths.js.src )
    .pipe( g.plumber() )
    .pipe( interpolateEnvVars() )
    .pipe( g.uglify( uglifyOpts ) )
    .pipe( gulp.dest( paths.js.dest ) )
    .pipe( g.connect.reload() )
} )

gulp.task( 'build:styles', () => {
  gulp.src( paths.styles.src )
    .pipe( g.plumber() )
    .pipe( interpolateEnvVars() )
    .pipe( g.less() )
    .pipe( g.autoprefixer( autoprefixerOpts ) )
    .pipe( gulp.dest( paths.styles.dest ) )
    .pipe( g.connect.reload() )
} )

// ----------------------------------------
// Watch
// ----------------------------------------
gulp.task( 'watch', (cb) => {
  gulp.watch( [paths.fonts.watch || paths.fonts.src], ['build:fonts'] )
  gulp.watch( [paths.html.watch || paths.html.src], ['build:html'] )
  gulp.watch( [paths.images.watch || paths.images.src], ['build:images'] )
  gulp.watch( [paths.js.watch || paths.js.src], ['build:js'] )
  gulp.watch( [paths.styles.watch || paths.styles.src], ['build:styles'] )
  cb()
} )

// ----------------------------------------
// Default
// ----------------------------------------
gulp.task( 'default', cb => {
  runSequence(
    'clean',
    [
      'build',
      'watch',
      'serve',
    ],
    cb
  )
} )
