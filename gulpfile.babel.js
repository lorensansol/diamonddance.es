// Development Mode
const devMode = false

// Common
import gulp from 'gulp'
import data from 'gulp-data'
import rename from 'gulp-rename'
import concat from 'gulp-concat'

// HTML
import pug from 'gulp-pug'

// CSS
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import comments from 'postcss-discard-comments'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import purgecss from 'gulp-purgecss'

// JavaScript
import babel from 'gulp-babel'
import terser from 'gulp-terser'

// IMG
import imagemin from 'gulp-imagemin'

// Google Fonts
import googleWebFonts from 'gulp-google-webfonts'

// Browser Sync
import { init as server, stream, reload } from 'browser-sync'

const productos = [
  'modelo-420-decoracion-elegance-marron-claro',
  'modelo-420-sin-decorar-cobre',
  'modelo-420-sin-decorar-negro',
  'modelo-520-decoracion-estelar-negro',
  'modelo-520-sin-decorar-marron-claro',
  'modelo-520-sin-decorar-negro',
  'modelo-620-decoracion-mandala-negro',
  'modelo-620-decoracion-panamera-cobre',
  'modelo-620-pala-decorada-cobre',
  'modelo-620-pala-decorada-negro',
  'modelo-620-sin-decorar-cobre',
  'modelo-620-sin-decorar-negro',
  'modelo-720-pala-decorada-negro',
  'modelo-720-sin-decorar-negro',
  'modelo-720-sin-decorar-plata',
  'modelo-820-decoracion-deluxe-azul',
  'modelo-820-decoracion-deluxe-rojo',
  'modelo-820-decoracion-deluxe-rosa-palo',
  'modelo-820-pala-decorada-cobre',
  'modelo-820-sin-decorar-azul',
  'modelo-820-sin-decorar-cobre',
  'modelo-820-sin-decorar-negro',
  'modelo-820-sin-decorar-rojo',
  'modelo-820-sin-decorar-rosa-palo',
  'modelo-jazz-marron-claro',
]

// Crea una copia del archivo y lo renombra por cada producto
gulp.task('prod', () => {
  return productos.forEach(producto => {
    gulp
      .src('src/views/template/producto.pug')
      .pipe(rename(producto + '.pug'))
      .pipe(gulp.dest('src/views/pages/zapatos'))
  })
})

// Convierte de PUG a HTML teniendo en cuenta la variable relativePath (filename)
gulp.task('html', () => {
  return gulp
    .src('src/views/pages/**/*.pug')
    .pipe(
      data(file => {
        return {
          fileName: file.history[0].replace(/.*\/(.*?)\.pug/gi, '$1'),
          devMode: devMode,
        }
      })
    )
    .pipe(pug({ pretty: devMode }))
    .pipe(gulp.dest('dist'))
})

gulp.task('pug', () => {
  return gulp.series('prod', 'pug')
})

gulp.task('css', () => {
  if (devMode) {
    return gulp
      .src('src/scss/styles.scss')
      .pipe(sass())
      .pipe(gulp.dest('dist/css'))
      .pipe(stream())
  } else {
    return gulp
      .src('src/scss/styles.scss')
      .pipe(sass())
      .pipe(
        purgecss({
          content: ['dist/**/*.html', 'dist/js/*.js'],
          variables: true,
        })
      )
      .pipe(postcss([comments({ removeAll: true }), cssnano(), autoprefixer()]))
      .pipe(gulp.dest('dist/css'))
      .pipe(stream())
  }
})

const filesJs = [
  'src/js/lib/jquery.js',
  'node_modules/bootstrap/dist/js/bootstrap.min.js',
  'src/js/lib/lightbox.min.js',
  'src/js/scroll-behavior-smooth.js',
  'src/js/scroll-shot.js',
  'src/js/scroll-show.js',
  'src/js/lazy-load.js',
  'src/js/custom.js',
]

gulp.task('js', () => {
  if (devMode) {
    return gulp
      .src(filesJs)
      .pipe(concat('scripts.js'))
      .pipe(gulp.src('src/js/smooth-scroll.min.js'))
      .pipe(gulp.dest('dist/js'))
  } else {
    return gulp
      .src(filesJs)
      .pipe(babel())
      .pipe(concat('scripts.js'))
      .pipe(gulp.src('src/js/smooth-scroll.min.js'))
      .pipe(terser())
      .pipe(gulp.dest('dist/js'))
  }
})

gulp.task('img', () => {
  return gulp
    .src('src/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 50, progressive: true }),
        imagemin.optipng({ optimizationLevel: 1 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest('dist/img'))
})

gulp.task('gfonts', () => {
  return gulp
    .src('fonts.list')
    .pipe(googleWebFonts({ fontDisplayType: 'swap' }))
    .pipe(gulp.dest('dist/gfonts'))
})

gulp.task('rest', () => {
  return gulp.src(['src/*.*', 'src/.*']).pipe(gulp.dest('dist'))
})

gulp.task('all', gulp.series('html', 'css', 'js', 'img', 'rest'))

gulp.task('default', () => {
  server({
    server: 'dist',
  })
  gulp.watch('src/views/**/*.pug', gulp.series('html', reload))
  gulp.watch('src/js/**/*.js', gulp.series('js', reload))
  gulp.watch('src/scss/**/*.scss', gulp.series('css'))
})
