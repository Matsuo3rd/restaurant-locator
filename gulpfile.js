var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var less = require('gulp-less-sourcemap');

// Static Server
gulp.task('serve', function() {
    browserSync.init({
        server: "."
    });
});

// Watching scss/less/html files
gulp.task('watch', ['serve', 'babel', 'sass'/*, 'less'*/], function() {
  gulp.watch("assets/babel/*.js", ['babel']);  
  gulp.watch("assets/scss/*.scss", ['sass']);
  //gulp.watch("assets/less/*.less", ['less']);
  gulp.watch("*.html").on('change', browserSync.reload);
});

//Compile BABEL into JS & auto-inject into browsers
gulp.task('babel', function() {
  return gulp.src('assets/babel/*.js')
      .pipe(babel({
          presets: ['env']
      }))
      .on('error', function(err) {
          console.log('[Compilation Error]');
          console.log(err.fileName + ( err.loc ? `( ${err.loc.line}, ${err.loc.column} ): ` : ': '));
          console.log('error Babel: ' + err.message + '\n');
          console.log(err.codeFrame);
          this.emit('end');
       })
      .pipe(gulp.dest('assets/js'))
      .pipe(browserSync.stream());
});

// Compile SASS into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src("assets/scss/*.scss")
    .pipe(sass({
      sourceComments: 'map',
      sourceMap: 'scss'
    }))
    .on('error', function(err) {
	console.log('[Compilation Error]');
	//console.log(err.fileName + ( err.loc ? `( ${err.loc.line}, ${err.loc.column} ): ` : ': '));
	console.log('error Babel: ' + err.message + '\n');
	//console.log(err.codeFrame);
	this.emit('end');
     })
    .pipe(gulp.dest("assets/css"))
    .pipe(browserSync.stream());
});

// Compile LESS into CSS & auto-inject into browsers
/*gulp.task('less', function() {
  return gulp.src("assets/less/*.less")
    .pipe(less({
      sourceMap: {
        sourceMapRootpath: './assets/less' // Optional absolute or relative path to your LESS files
      }
    }))
    .pipe(gulp.dest("assets/css"))
    .pipe(browserSync.stream());
});*/


gulp.task('default', ['serve']);
gulp.task('server', ['serve']);
gulp.task('dev', ['watch']);