const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

// Local build only. When the platform builds a block it replaces this file with
// its own config (backend services/blocks/buildSecurity.ts), rendered from the
// block's build profile: the container name becomes `block_<blockId>`, `./Block`
// and `./Component` are exposed, and React is a shared singleton. This file
// mirrors that contract so `npm run build` on your machine yields the same shape.
module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  devtool: 'source-map',
  devServer: {
    port: 3001,
    open: true,
    hot: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new ModuleFederationPlugin({
      // Replaced by the platform with `block_<blockId>`. The library lives on
      // the plugin, not on `output`, so only the container entry assigns the
      // global (an `output.library` would make bundle.js overwrite it).
      name: 'block_local',
      library: { type: 'var', name: 'block_local' },
      filename: 'remoteEntry.js',
      exposes: {
        // mount(container, props) — the API every Mexty host calls. Required.
        './Block': './src/App',
        // The Block component itself, for hosts that share React (e.g. a game
        // host rendering this block in-world).
        './Component': './src/block',
      },
      // React is a shared singleton: a host running React 19 renders this
      // block's component inline; loaded alone the block uses its own bundled
      // copy. `eager` keeps the synchronous entry in src/index.tsx working.
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^19.0.0', strictVersion: false },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^19.0.0', strictVersion: false },
      },
    }),
  ],
  externals: {},
  optimization: {
    splitChunks: false,
    concatenateModules: true,
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    // One chunk-loading global per block, so several blocks can share a page.
    uniqueName: 'block_local',
    publicPath: 'auto',
  },
};
