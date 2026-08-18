// Plugin Docusaurus para adicionar polyfills Node.js necessários para swagger-ui-react
const webpack = require('webpack');

module.exports = function pluginWebpackPolyfills() {
  return {
    name: 'webpack-polyfills',
    configureWebpack() {
      return {
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          }),
        ],
      };
    },
  };
};
