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

browserSync({
    server     : "build",
    files      : ["src/**/*.md", "src/**/*.scss", "templates/*.html"],
    middleware : function (req, res, next) {
        build(next);
    }
});

function build (callback) {
    Metalsmith(__dirname)
        .use(collections({posts: {pattern: "posts/*.md", sortBy: 'title'}}))
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
        .use(beautify({
        preserve_newlines: false
    }))
        .build(err => {
        let message = err ? err : 'Build complete';
        console.log(message);
        callback();
    });
}
