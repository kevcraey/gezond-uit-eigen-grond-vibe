const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  return {
    mode: 'production',
    devtool: isDevelopment ? 'eval-source-map' : false,
    entry: {
      index: './src/wizard/paginas/gezond-index.ts',
    },
    output: {
      filename: '[name].bundle.[chunkhash].js',
      path: path.resolve(__dirname, 'build'),
      hashFunction: 'sha256',
    },
    performance: {
      hints: false,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/i,
          use: 'ts-loader',
          include: [path.resolve(__dirname, 'src')],
          exclude: /node_modules/,
        },
        {
          test: /\.m?js$/i,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          oneOf: [
            // 1) CSS with ?raw -> import as string
            {
              test: /\.css$/i,
              resourceQuery: /raw/,
              type: 'asset/source',
            },
            // 2) normal CSS -> via extract plugin
            {
              test: /\.css$/i,
              use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
          ],
        },
      ],
    },
    devServer: {
      static: './build',
      proxy: {
        context: ['/rest', '/sso', '/login', '/logout'],
        target: 'http://localhost:8080',
      },
      client: {
        overlay: false,
      },
      historyApiFallback: {
        rewrites: [
          { from: /^\/index(\/)?$/, to: '/index.html' },
        ],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/public/html/index.html',
        scriptLoading: 'defer',
        chunks: ['browser-support', 'index'],
        favicon: 'src/public/img/favicon.ico',
        baseUrl: '/',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/public/img',
            to: 'img',
          },
          {
            from: 'src/public/mock-config.json',
            to: 'mock-config.json',
          },
          {
            from: 'src/public/wizard-config.json',
            to: 'wizard-config.json',
          },
        ],
      }),
      new MiniCssExtractPlugin(),
    ],
  };
};
