const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

// Local build only. The platform replaces this file with its own config,
// rendered from the block's build profile — `"mexty": { "profile": "engine" }`
// in package.json. This mirrors that engine profile: the 3D stack and the
// engine are shared singletons (non-eager, hence the async bootstrap entry),
// `./Block` exposes the mount API, `./Component` the Block component.
const singleton = (requiredVersion) => ({ singleton: true, eager: false, strictVersion: false, requiredVersion });

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  devtool: 'source-map',
  resolve: { extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'] },
  module: {
    rules: [
      { test: /\.(tsx?|jsx?)$/, use: { loader: 'ts-loader', options: { transpileOnly: true } }, exclude: /node_modules/ },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new ModuleFederationPlugin({
      name: 'block_local',
      library: { type: 'var', name: 'block_local' },
      filename: 'remoteEntry.js',
      exposes: { './Block': './src/App', './Component': './src/block' },
      shared: {
        react: singleton('^19.2.7'),
        'react-dom': singleton('^19.2.7'),
        three: singleton('^0.184.0'),
        '@react-three/fiber': singleton('^9.4.0'),
        '@react-three/drei': singleton('^10.7.0'),
        '@react-three/rapier': singleton('^2.2.0'),
        zustand: singleton('^5.0.0'),
        '@mexty/engine': singleton('^0.1.0'),
      },
    }),
  ],
  optimization: { splitChunks: false, concatenateModules: true },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    uniqueName: 'block_local',
    publicPath: 'auto',
  },
};
