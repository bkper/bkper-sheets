var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');

exports.default = () => {
  return gulp.src('./src/*.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./dist'));
}