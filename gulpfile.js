'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const minify = require('gulp-minify');
const dist = 'dist/';

gulp.task('clean', () => gulp.src(dist, {read: false})
    .pipe(clean()));

const opt = {
    ext: {
        min: '.js'
    },
    noSource: true
};

gulp.task('js', () => gulp.src(['./*/**/*.js', './index.js', '!./test/**', '!./node_modules/**'])
    .pipe(minify(opt))
    .pipe(gulp.dest(dist)));

gulp.task('default', gulp.series('clean', 'js'));
