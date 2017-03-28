var webpack = require('webpack');
// import path from 'path';
var ClosureCompilerPlugin = require('webpack-closure-compiler');

var PLUGINS = [];
if (process.env.NODE_ENV === 'production') {
  PLUGINS.push(    new ClosureCompilerPlugin({
        compiler: {
          language_in: 'ECMASCRIPT6',
          language_out: 'ECMASCRIPT5',
          compilation_level: 'SIMPLE'
        },
        concurrency: 3,
      }))
}

module.exports = {
  entry: ['whatwg-fetch','./src/index.js'],
  output: {
    path: __dirname,
    filename: 'build.js'
  },
  plugins: PLUGINS,
  module: {
      rules: [{
          test: /\.scss$/,
          use: [{
              loader: "style-loader" // creates style nodes from JS strings
          }, {
              loader: "css-loader" // translates CSS into CommonJS
          }, {
              loader: "sass-loader" // compiles Sass to CSS
          }]
      },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ }
    ]}
};
