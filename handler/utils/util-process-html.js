const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpReplace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlmin = require("gulp-htmlmin");
const processHtmlContent = require('./util-process-html-content');
const utilGetPageFolder = require('./util-get-entry-pages-folder');

let writeHtmlDelayTimer = null;

function buildHtml(finalConfig) {
    let pagesFolder = utilGetPageFolder(finalConfig.srcFolder);

    if (!pagesFolder) {
        return;
    }

    const htmlFolder = finalConfig.javaProject ? finalConfig.buildFolder : path.join(finalConfig.buildFolder, 'pages'); // java 项目的 html 产物位于 build/*.html 而不是 build/pages/*.html

    let stream = gulp.src([`!${path.join(pagesFolder, '/**/*.tpl.html')}`, path.join(pagesFolder, '/**/index.html')]);

    if (finalConfig.replace) {
        Object.keys(finalConfig.replace).forEach((key) => { stream = stream.pipe(gulpReplace(new RegExp(key.replace(/\$/g, '\\$'), 'g'), finalConfig.replace[key][finalConfig.currentEnv])) });
    }

    let pipeline = stream.pipe(rename((_path) => {
        _path.basename = _path.dirname;
        _path.dirname = '';
    }));

    if (/build/.test(finalConfig.currentEnv)) {
        pipeline = pipeline.pipe(htmlmin({ minifyJS: true, minifyCSS: true, collapseWhitespace: true, removeComments: false })).pipe(gulp.dest(htmlFolder));
    }

    pipeline = pipeline.pipe(gulp.dest(htmlFolder));

    // build 目录的 html 文件生成后，添加一些通用脚本，比如埋点、jsbridge、flexible 等
    pipeline.on('end', () => {
        clearTimeout(writeHtmlDelayTimer);
        writeHtmlDelayTimer = setTimeout(() => {
            let htmlFiles = [];

            if (fs.existsSync(htmlFolder)) {
                htmlFiles = fs.readdirSync(htmlFolder).filter(filename => /\.html$/.test(filename)).map(filename => path.join(htmlFolder, filename));
            }

            processHtmlContent(htmlFiles, {
                ...finalConfig,
                callback() {
                    // 执行 onHtmlBuild 回调
                    if (finalConfig.onHtmlBuild && fs.existsSync(htmlFolder)) {
                        finalConfig.onHtmlBuild(htmlFiles);
                    }
                }
            });
        }, 500);
    });

}

module.exports = (finalConfig) => {
    buildHtml(finalConfig);
    finalConfig.watch && gulp.watch([path.join(utilGetPageFolder(finalConfig.srcFolder), '/**/index.html')], () => {
        buildHtml(finalConfig)
    });
};
