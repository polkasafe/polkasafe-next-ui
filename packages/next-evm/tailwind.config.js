module.exports = {
	content: [
		// add the paths to all of your template files
		'./src/*.{jsx,tsx}',
		'./src/**/*.{jsx,tsx}'
	],
	important: true, // to generate utilities as !important
	theme: {
		extend: {
			colors: {
				'bg-main': '#1B2028',
				'bg-secondary': '#24272E',
				'failure': '#E63946',
				'highlight': '#1A2A42',
				'primary': '#1573FE',
				'success': '#06D6A0',
				'text_main': '#FFFFFF',
				'text_placeholder': '#505050',
				'text_secondary': '#8B8B8B',
				'waiting': '#FF9F1C',
				'network_badge': '#5065E4',
				'proxy-pink': '#FF79F2'
			},
			fontFamily: {
				// add new font family
				primary: ['Archivo', 'sans-serif']
			}
		}
	},
	plugins: []
};
