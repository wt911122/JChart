const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
// const rename = require('gulp-rename');

exports.default = function() {
    return src('src/**/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('dist.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
};
