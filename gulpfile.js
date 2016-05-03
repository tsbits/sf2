var gulp = require( 'gulp' );
var uglify = require( 'gulp-uglify' );
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var del = require( 'del' );


////////////////
// NANO TASKS //
////////////////


// Deleting all dist content
gulp.task( 'clean', function() {
  return del.sync( 'build' );
} );

// Minifying / uglifying libs
gulp.task( 'min', function() {
  gulp.src('libs/*.js')
    .pipe(uglify())
    .pipe(rename(function (path){
        if(path.extname === '.js'){
            path.basename += '.min';
        }
    }))
    .pipe(gulp.dest('build'));
} );


/////////////////
// MACRO TASKS //
/////////////////


// Build each libs apart
gulp.task( 'build-libs', ['clean', 'min'] );

// Build sf2
gulp.task( 'sf2', function(){
  // Concat all sf2 componant to sf2
  gulp.src('build/*.js')
    .pipe(concat('sf2.min.js'))
    .pipe(gulp.dest('build/'));
} );