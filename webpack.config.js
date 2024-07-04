const path = require('path');

module.exports = {
  entry: {
    signup: './frontend/public/firebaseSignup.js',
    login: './frontend/public/firebaseLogin.js',
    employerlogin: './frontend/public/employerLogin.js',
    employersignup: './frontend/public/employerSignup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'frontend', 'public'),
    publicPath: '/frontend/public/' // Adjust if your files are served from a different path
  },
  mode: 'development', // Set to 'production' for production builds
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
