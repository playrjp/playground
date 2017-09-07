'use strict';

const Metalsmith  = require('metalsmith');
const collections = require('metalsmith-collections');
const markdown    = require('metalsmith-markdown');
const permalinks  = require('metalsmith-permalinks');
const templates   = require('metalsmith-templates');
const sass        = require('metalsmith-sass');
const beautify    = require('metalsmith-beautify');
const updated     = require('metalsmith-updated');
const browserSync = require('browser-sync');
const argv        = require('argv');

/**
 * コマンドラインのオプションを設定
 */
const args = argv.option({
    name: 'mode',
    short: 'm',
    type: 'string',
    description: 'Select a mode for imgoptim',
    example: "'script --mode=value' or 'script -m value'"
}).run();

const Playground = function () {
    // インスタンスを生成
    if (!(this instanceof Playground)) {
        return new Playground();
    }

    // オプションによりタスクを分岐
    switch (args.options.mode) {
        case 'watch' :
            this.watch(this);
            break;
        default :
            this.build();
            break;
    }
}

Playground.prototype.build = callback => {
    Metalsmith(__dirname)
        .use(collections({
            posts: {
                pattern: "posts/*.md",
                sortBy : 'title'
            }
        }))
        .use(markdown())
        .use(permalinks({pattern: ':title'}))
        .use(updated())
        .use(templates('nunjucks'))
        .source('src/')
        .destination('build/')
        .use(sass({
            outputStyle: "expanded",
            outputDir: 'css/'
        }))
        .build(err => {
            const message = err ? err : 'Build complete';
            console.log(message);

            if (args.options.mode === 'watch') {
                callback();
            }
        });
}

Playground.prototype.watch = ctx => {
    browserSync({
        server     : "build",
        files      : ["src/**/*.md", "src/**/*.scss", "templates/*.html"],
        middleware : (req, res, next) => {
            ctx.build(next);
        }
    });
}

module.exports = Playground();
