const { src, dest, series } = require('gulp');
var inlinesource = require('gulp-inline-source');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

function transpile() {
  return tsProject.src()
        .pipe(tsProject())
        .js.pipe(dest('build/'));
}

function copy() {
  return src('src/*.+(html|css)')
    .pipe(dest('build/'));
}

function bundle() {
  return src('./build/*.html')
    .pipe(inlinesource())
    .pipe(dest('./dist'))
}

exports.default = series(transpile, copy, bundle);