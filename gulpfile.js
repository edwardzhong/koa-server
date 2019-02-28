const { src, dest, watch, series } = require('gulp');
const postcss = require('gulp-postcss');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
sass.compiler = require('node-sass');

function parseScss() {
    return src('./public/scss/**/*.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))//outputStyle: expanded,compact,compressed
        .pipe(postcss())
        .pipe(dest('./public/css'))
}

function dist(){
    return src('./public/css/*.css')
    .pipe(cleanCSS({ compatibility: 'ie9' }))//压缩代码，兼容浏览器，优化代码
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist/css'));
}

// series   从左至右依次串行执行任务
// parallel 并行执行任务
const task = series(parseScss, dist);
// watch('./public/scss/**/*.scss', task);
exports.default = task;
