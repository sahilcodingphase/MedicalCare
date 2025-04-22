const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');
const spritesmith = require('gulp.spritesmith');

// Paths
const paths = {
    styles: {
        src: 'src/scss/**/*.scss',
        dest: 'dist/css'
    },
    scripts: {
        src: 'src/js/**/*.js',
        dest: 'dist/js'
    },
    images: {
        src: 'src/images/**/*',
        dest: 'dist/images'
    },
    sprites: {
        src: 'src/sprites/*.png',
        dest: 'dist/images',
        css: 'src/scss'
    },
    html: {
        src: '*.html',
        dest: 'dist'
    }
};

// Clean dist directory
function clean() {
    return del(['dist']);
}

// Compile SCSS to CSS
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

// Minify and concatenate JavaScript
function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

// Optimize images
function images() {
    return gulp.src(paths.images.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(paths.images.dest));
}

// Generate sprite and CSS
function sprite() {
    const spriteData = gulp.src(paths.sprites.src)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            imgPath: '../images/sprite.png',
            padding: 20,
            algorithm: 'binary-tree',
            cssTemplate: 'src/scss/sprite-template.handlebars',
            cssVarMap: function(sprite) {
                sprite.name = 'sprite-' + sprite.name;
            }
        }));

    const imgStream = spriteData.img
        .pipe(imagemin())
        .pipe(gulp.dest(paths.sprites.dest));

    const cssStream = spriteData.css
        .pipe(gulp.dest(paths.sprites.css));

    return Promise.all([imgStream, cssStream]);
}

// Copy HTML files
function html() {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
}

// Watch for changes
function watch() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.sprites.src, sprite);
    gulp.watch(paths.html.src, html);
}

// Define complex tasks
const build = gulp.series(clean, gulp.parallel(styles, scripts, images, sprite, html));
const dev = gulp.series(build, watch);

// Export tasks
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.html = html;
exports.watch = watch;
exports.build = build;
exports.default = dev; 