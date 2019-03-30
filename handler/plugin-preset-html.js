const path = require('path');
const gulp = require('gulp');
const gulpReplace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlmin = require("gulp-htmlmin");

function buildHtml({ srcDir, distDir, taskName, replace, compress }) {
    let stream = gulp.src([path.join(srcDir, '/pages/**/*.html')]);

    if (replace) {
        Object.keys(replace).forEach((key) => {
            stream = stream.pipe(gulpReplace(new RegExp(key.replace(/\$/g, '\\$'), 'g'), replace[key][taskName]));
        });
    }

    stream = stream.pipe(rename((_path) => {
        _path.basename = _path.dirname;
        _path.dirname = '';
    }));

    if (compress) {
        stream = stream.pipe(htmlmin({
            minifyJS: true,
            minifyCSS: true,
            collapseWhitespace: true,
            removeComments: true
        }));
    }

    stream = stream.pipe(gulp.dest(path.join(distDir, 'pages')));
}

function PresetHtml({ srcDir, distDir, watch, taskName, replace, compress }) {
    buildHtml({ srcDir, distDir, watch, taskName, replace, compress });

    if (watch) {
        gulp.watch([path.join(srcDir, 'pages/**/*.html')], () => {
            buildHtml({ srcDir, distDir, watch, taskName, replace, compress });
        });
    }
}

PresetHtml.prototype.apply = () => { };

module.exports = PresetHtml;
