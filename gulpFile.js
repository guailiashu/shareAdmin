var gulp = require("gulp");
var tsc = require("gulp-typescript-compiler");
var ts = require('gulp-typescript');
var nodemon = require("gulp-nodemon");
var sass = require('gulp-sass');

var gulp = require('gulp');


var tsProject = ts.createProject('./tsconfig.json');

gulp.task("default", ["compile", "watch", "nodemon", 'sass', 'sass:watch']);


gulp.task("watch", function() {
    return gulp.watch(["./src/**/*.ts"], ["compile"]);
});


gulp.task("compile", function() {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));

});

gulp.task("nodemon", function() {
    nodemon({
        script: "dist/www",
        // exec: ' ', // set DEBUG=*,-not_this &node --debug
        env: {
            'NODE_ENV': 'production'
        }

    });
});



gulp.task('sass', function() {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function() {
    gulp.watch('./sass/**/*.scss', ['sass']);
});