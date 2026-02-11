/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		tsconfigRootDir: __dirname,
	},
	plugins: ['n8n-nodes-base'],
	rules: {
		'n8n-nodes-base/community-package-json-name-still-default': 'off',
	},
};
