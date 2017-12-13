const path = require('path');
const gulp = require('gulp');
const gulpReplace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlmin = require("gulp-htmlmin");

function buildHtml({ srcDir, distDir, watch, taskName, replace, compress }) {
    const distDirName = distDir.replace(/\/$/, '').split('/').pop();
    let stream = gulp.src([`!${path.join(srcDir, 'node_modules/**/*')}`, `!${path.join(srcDir, distDirName, '/**/*')}`, `!${path.join(distDir, '/**/*.html')}`, path.join(srcDir, '/pages/**/*.html')]);

    if (replace) {
        Object.keys(replace).forEach((key) => {
            stream = stream.pipe(gulpReplace(new RegExp(key.replace(/\$/g, '\\$'), 'g'), replace[key][taskName]));
        });
    }

    if (compress) {
        stream.pipe(rename((_path) => {
            _path.basename = _path.dirname;
            _path.dirname = '';
        })).pipe(htmlmin({
            minifyJS: true,
            minifyCSS: true,
            collapseWhitespace: true,
            removeComments: true
        })).pipe(gulp.dest(path.join(distDir, 'pages')));
    } else {
        stream.pipe(rename((_path) => {
            _path.basename = _path.dirname;
            _path.dirname = '';
        })).pipe(gulp.dest(path.join(distDir, 'pages')));
    }
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
