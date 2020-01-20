const { src, dest, watch, series, task } = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const nodemon = require('gulp-nodemon');

function clean(cb) {
	return del(['dist'], cb);
}

function toJs() {
	return src('src/**/*.ts')
		.pipe(tsProject())
		.pipe(dest('dist'));
}

function watchFile() {
	nodemon({
		inspect: true,
		script: 'dist/app.js',
		watch: ['src'],
		ext: 'ts',
		env: { NODE_ENV: 'development' },
		tasks: ['build'],
	});
}

// series   从左至右依次串行执行任务
// parallel 并行执行任务
const build = series(clean, toJs);
task('build', build);
exports.build = build;
exports.default = series(build, watchFile);
