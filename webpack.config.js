const path = require('path');

module.exports = {
  entry: './client/App.jsx',
  mode: process.env.NODE_ENV || 'development',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.min.js',
    publicPath: './public',
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-react', '@babel/preset-env']
            },
        }
      },
    ],
  },
};