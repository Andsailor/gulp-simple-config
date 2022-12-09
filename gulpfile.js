import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import autoprefix from "gulp-autoprefixer";
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import clear from 'gulp-clean';
import csso from 'gulp-csso';
import browserSync from 'browser-sync';
const sass = gulpSass(dartSass);

// Production destination. Can be changed to /dist /dest.
const dest = './docs';

// Minification and relocating index.html.
gulp.task('html', function() {
    return gulp.src('./src/index.html')
            .pipe(htmlmin({ collapseWhitespace: true }))
            .pipe(gulp.dest(dest));
});

// scss to css convertation, minification, adding prefixes.
gulp.task('scss', function() {
    return gulp.src('./src/sass/index.scss')
            .pipe(sass())
            .pipe(autoprefix({
                overrideBrowserslist: ['>0.5%', 'last 2 versions', 'Firefox ESR', 'not dead'],
                cascade: false
            }))
            .pipe(csso())
            .pipe(rename('style.css'))
            .pipe(gulp.dest(dest + "/css"))
            .pipe(browserSync.stream());       
});

// Minification of images.
gulp.task('images', function() {
    return gulp.src('./src/img/*')
            .pipe(newer(dest + '/img'))
            .pipe(imagemin())
            .pipe(gulp.dest(dest + '/img'));
});

// Concat JS files, minification and adding polyfills.
gulp.task('javascript', function() {
    return gulp.src('./src/js/**/*.js')
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            .pipe(uglify())
            .pipe(concat('script.js'))
            .pipe(gulp.dest(dest + '/js'))
            .pipe(browserSync.stream());           
});

// Cleaning Dest folder.
gulp.task('clear', function() {
    return gulp.src(dest + '/')
            .pipe(clear());
});

// Developlent mode. Type "npm run dev" in your terminal.
gulp.task('dev', gulp.series('clear', gulp.parallel('html', 'scss', 'images', 'javascript'), function() {
    browserSync.init({
        server: {
            baseDir: "./docs" // Change it if you have another dest folder.
        }
    });

    gulp.watch('./src/img/**/*', gulp.parallel('images'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('javascript'));
    gulp.watch('./src/sass/**/*.scss', gulp.parallel('scss'));
    gulp.watch('./src/index.html', gulp.parallel('html')).on('change', browserSync.reload);
}));

// Prod mode. Type "npm run build" in your terminal.
gulp.task('build', gulp.series('clear', gulp.parallel('html', 'scss', 'images', 'javascript')));