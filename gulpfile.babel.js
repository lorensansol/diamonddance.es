// Common
import gulp from 'gulp'
import data from 'gulp-data'
// import rename from 'gulp-rename'
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

// Variables
export const devMode = false

gulp.task('html', () => {
  return gulp
    .src('./_pug/pages/**/*.pug')
    .pipe(
      data(file => {
        return {
          devMode: devMode,
          require: require
        }
      })
    )
    .pipe(pug({ pretty: devMode }))
    .pipe(gulp.dest('./'))
})

const filesJs = [
  'node_modules/bootstrap.native/dist/bootstrap-native.js',
  'node_modules/simplelightbox/dist/simple-lightbox.js',
  './_assets/js/scroll-behavior-smooth.js',
  './_assets/js/scroll-shot.js',
  './_assets/js/scroll-show.js',
  './_assets/js/lazy-load.js',
  './_assets/js/custom.js'
]

gulp.task('js', () => {
  if (devMode) {
    return gulp
      .src(filesJs)
      .pipe(concat('scripts.js'))
      .pipe(gulp.src('./_assets/js/smooth-scroll.min.js'))
      .pipe(gulp.dest('./js'))
  } else {
    return gulp
      .src(filesJs)
      .pipe(babel())
      .pipe(concat('scripts.js'))
      .pipe(gulp.src('./_assets/js/smooth-scroll.min.js'))
      .pipe(terser())
      .pipe(gulp.dest('./js'))
  }
})

gulp.task('css', () => {
  if (devMode) {
    return gulp
      .src('./_assets/scss/styles.scss')
      .pipe(sass())
      .pipe(gulp.dest('./css'))
      .pipe(stream())
  } else {
    return gulp
      .src('./_assets/scss/styles.scss')
      .pipe(sass())
      .pipe(
        purgecss({
          content: ['./_site/*.html', './js/*.js'],
          variables: true,
          // Correct bootstrap.native carousel
          whitelist: [
            'carousel-item-next',
            'carousel-item-prev',
            'carousel-item-left',
            'carousel-item-right'
          ]
        })
      )
      .pipe(postcss([comments({ removeAll: true }), cssnano(), autoprefixer()]))
      .pipe(gulp.dest('./css'))
      .pipe(stream())
  }
})

gulp.task('img', () => {
  return gulp
    .src('./_assets/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 50, progressive: true }),
        imagemin.optipng({ optimizationLevel: 1 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest('./img'))
})

gulp.task('gfonts', () => {
  return gulp
    .src('fonts.list')
    .pipe(googleWebFonts({ fontDisplayType: 'swap' }))
    .pipe(gulp.dest('_assets/gfonts'))
})

gulp.task('all', gulp.series('html', 'js', 'css'))

gulp.task('default', () => {
  server({
    server: {
      baseDir: './',
      serveStaticOptions: {
        extensions: ['html']
      }
    }
  })
  gulp.watch('./_pug/**/*.pug', gulp.series('html', reload))
  gulp.watch('./_assets/js/**/*.js', gulp.series('js', reload))
  gulp.watch('./_assets/scss/**/*.scss', gulp.series('css'))
})
