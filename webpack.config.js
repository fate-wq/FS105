const path = require('path');

module.exports = {
  entry: {
    signup: './frontend/public/firebaseSignup.js',
    login: './frontend/public/firebaseLogin.js'
  },
  output: {
    filename: '[name].bundle.js', 
    path: path.resolve(__dirname, './frontend/public')
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
