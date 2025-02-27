// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		// add the paths to all of your template files
		'./*.{jsx,tsx}',
		'./**/*.{jsx,tsx}',
		'../common/*.{jsx,tsx}',
		'../common/**/*.{jsx,tsx}'
	],
	important: true, // to generate utilities as !important
	theme: {
		extend: {
			colors: {
				primary: 'var(--primary)',
				label: 'var(--label)',
				highlight: 'var(--highlight)',
				danger: 'var(--danger)',
				'light-red': 'var(--light-red)',
				'bg-main': 'var(--bg-main)',
				'bg-secondary': 'var(--bg-secondary)',
				success: 'var(--success)',
				waiting: 'var(--waiting)',
				failure: 'var(--failure)',
				'text-primary': 'var(--text-primary)',
				'text-outline-primary': 'var(--text-outline-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-danger': 'var(--text-danger)',
				'text-disabled': 'var(--text-disabled)',
				'disabled-btn-text': 'var(--disabled-btn-text)',
				'text-success': 'var(--text-success)',
				'network-badge': 'var(--network-badge)',
				'proxy-pink': 'var(--proxy-pink)',
				'org-primary-bg': 'var(--org-primary-bg)',
				'bg-success': 'var(--bg-success)',
				'bg-failure': 'var(--bg-failure)',
				'bg-main-dark': 'var(--bg-main-dark)'
			},
			fontFamily: {
				primary: ['Inter', 'sans-serif'],
				raleway: ['Raleway', 'sans-serif']
			},
			backgroundImage: {
				'custom-gradient':
					'linear-gradient(60deg, #434449, #27305B, #34449A, #423C85, #34449A, #27305B, #27305B,#434449)',
				'org-gradient': 'radial-gradient(100% 100% at 50% 70%, #27305B 0%, rgba(54, 0, 96, 0.00) 100%)',
				'circle-1-gradient': 'linear-gradient(129deg, #701A75 11.01%, #C026D3 95%)',
				'circle-2-gradient': 'linear-gradient(76deg, #4C1D95 -15.25%, #7C3AED 100%)',
				'circle-3-gradient': 'linear-gradient(129deg, #312E81 11.01%, #4F46E5 95%)',
				'circle-4-gradient': 'linear-gradient(129deg, #655600 11.01%, #00CCE3 95%)'
			},
			flexBasis: {
				'1/7': '14.2857143%',
				'2/7': '28.5714286%',
				'3/7': '42.8571429%',
				'4/7': '57.1428571%',
				'5/7': '71.4285714%',
				'6/7': '85.7142857%',
				'1/8': '12.5%'
			},
			fontSize: {
				'2xs': '0.75rem',
				'3xs': '0.625rem'
			}
		}
	},
	plugins: []
};
