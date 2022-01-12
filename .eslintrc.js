module.exports = {
	root: true, // Make sure eslint picks up the config at the root of the directory
	parserOptions: {
		ecmaVersion: 2020, // Use the latest ecmascript standard
		sourceType: 'module', // Allows using import/export statements
		ecmaFeatures: {
			jsx: true, // Enable JSX since we're using React
		},
	},
	settings: {
		react: {
			version: 'detect', // Automatically detect the react version
		},
	},
	env: {
		// browser: true, // Enables browser globals like window and document
		amd: true, // Enables require() and define() as global variables as per the amd spec.
		node: true, // Enables Node.js global variables and Node.js scoping.
		es6: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:jsx-a11y/recommended',
		'next',
		'plugin:prettier/recommended', // Make this the last element so prettier config overrides other formatting rules
		'next/core-web-vitals',
	],
	ignorePatterns: ['**/vendor/*.js'],
	plugins: ['react-hooks'],
	rules: {
		'prettier/prettier': ['error', {}, { usePrettierrc: true }],
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'jsx-a11y/anchor-is-valid': [
			'error',
			{
				components: ['Link'],
				specialLink: ['hrefLeft', 'hrefRight'],
				aspects: ['invalidHref', 'preferButton'],
			},
		],
		'jsx-a11y/click-events-have-key-events': 'off',
		'react/prop-types': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',

		// TODO : figure out why these throw false positives and fix
		'no-undef': 'off',
		'no-unused-vars': 'off',
	},
};
