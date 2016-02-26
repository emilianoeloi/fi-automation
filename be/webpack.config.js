module.exports = {
	entry: './main.js',
	output: {
		path: './dist/',
		filename: 'index.js'
	},
	devServer: {
		contentBase: './',
		inline: true,
		port: 3333
	},
	resolve: {
		extensions: ['', '.js', 'jsx']
	},
	module:{
		loaders: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			loader:'babel',
			query: {
				presets: ['es2015','react']
			}
		}
		]
	}
}
