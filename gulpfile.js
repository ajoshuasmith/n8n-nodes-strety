const { src, dest, parallel } = require('gulp');

function copyIcons() {
	return src('nodes/**/*.{svg,png}').pipe(dest('dist/nodes/'));
}

function copyMetadata() {
	return src('nodes/**/*.node.json').pipe(dest('dist/nodes/'));
}

exports['build:icons'] = parallel(copyIcons, copyMetadata);
