/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const del = require('del');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', () => del('dist/**', { force: true }));

gulp.task('dist', () => tsProject.src()
  .pipe(tsProject())
  .pipe(uglify())
  .pipe(gulp.dest('dist')));

gulp.task('default', gulp.series('clean', 'dist'));
