const widths = {
	xxxs: '320px',
	xxs: '380px',
	xs: '480px',
	sm: '600px',
	md: '768px',
	lg: '1024px',
	xl: '1250px',
};

module.exports = {
	mode: 'jit',
	future: {
		removeDeprecatedGapUtilities: false,
		purgeLayersByDefault: false,
	},
	purge: [
		'./components/**/*.{js,ts,tsx}',
		'./pages/**/*.{js,ts,tsx}',
		// './constants/**/*.{js,ts,tsx}',
		'./utils/**/*.{js,ts,tsx}',
	],
	darkMode: false, // or 'media' or 'class'
	theme: {
		backgroundColor: theme => ({
			...theme('colors'),
			white: '#ffffff',
			black: '#000000',
			gray: {
				50: '#dfdcd7',
				100: '#bbbebf',
				200: '#7a859b',
				300: '#6c757d',
				400: '#5c6272',
				600: '#4c5264',
				// 650: '#393E4B',
				675: '#30343F',
				700: '#262932',
				800: '#1d1f26',
				900: '#191c22',
				950: '#161719',
				975: '#131313',
			},
			purple: {
				...theme('colors').purple,
				700: '#4b4acf',
			},
			blue: {
				...theme('colors').blue,
				400: '#5D5DFF',
			},
			green: {
				...theme('colors').green,
				400: '#4ed164',
			},
			theme: {
				main: '#7372f7', // 4B4ACF
			},
		}),
		borderColor: theme => ({
			...theme('backgroundColor'),
			blue: {
				...theme('colors').blue,
			},
		}),
		inset: {
			0: 0,
			1: '4px',
			2: '8px',
			3: '12px',
			64: '16rem',
		},
		screens: {
			...widths,
		},
		maxWidth: {
			...widths,
		},
		minWidth: {
			...widths,
		},
		textSize: {
			'2xs': '0.625rem',
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '2rem',
			'4xl': '2.25rem',
		},
		boxShadow: {
			container: '0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)',
			'elevation-08dp':
				'0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)',
			'elevation-24dp':
				'0px 24px 38px rgba(0, 0, 0, 0.14), 0px 9px 46px rgba(0, 0, 0, 0.12), 0px 11px 15px rgba(0, 0, 0, 0.2)',
			'elevation-04dp':
				'0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.2)',
			none: '0px 0px 0px rgba(0,0,0,0)',
		},
		zIndex: {
			0: 0,
			10: 10,
			20: 20,
			30: 30,
			40: 40,
			50: 50,
			60: 60,
			70: 70,
			80: 80,
			90: 90,
			100: 100,
		},
		extend: {
			letterSpacing: {
				tightest: '-0.1em',
			},
			textColor: {
				theme: {
					main: '#7372f7', // 4B4ACF
				},
				gray: {
					800: '#1d1f26',
				},
			},
			fontFamily: {
				mono: ['SFMono', 'ui-monospace'],
				sans: ['SFMono'],
				serif: ['SFMono'],
			},
		},
	},
};
