const { aliases, scssAliases, onwarn } = require('../config/webpack.parts');
const merge = require('webpack-merge');
const { CheckerPlugin } = require('awesome-typescript-loader');
const path = require('path');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

module.exports = ({ config, mode }) => {
  // console.dir(config, { depth: null });
  let mergedConfig = merge.smart(config, {
    module: {
      rules: [
        {
          test: /\.(svelte|html)$/,
          loader: 'svelte-loader',
          options: {
            onwarn: onwarn,
            preprocess: require('svelte-preprocess')({
              scss: {
                importer: [scssAliases(aliases)]
              }
            })
          }
        },
        {
          test: /\.stories\.tsx?$/,
          loaders: [
            {
              loader: require.resolve('@storybook/source-loader'),
              options: { parser: 'typescript' }
            }
          ],
          enforce: 'pre',
          include: [path.resolve(__dirname, '../src')]
        },
        {
          // 2a. Load `.stories.mdx` / `.story.mdx` files as CSF and generate
          //     the docs page from the markdown
          test: /\.(stories|story)\.mdx$/,
          use: [
            {
              loader: 'babel-loader',
              // may or may not need this line depending on your app's setup
              options: {
                plugins: ['@babel/plugin-transform-react-jsx']
              }
            },
            {
              loader: '@mdx-js/loader',
              options: {
                compilers: [createCompiler({})]
              }
            }
          ]
        },
        {
          test: /\.(stories|story)\.[tj]sx?$/,
          loader: require.resolve('@storybook/source-loader'),
          exclude: [/node_modules/],
          enforce: 'pre'
        }
      ]
    }
  });
  mergedConfig.resolve.alias = { ...mergedConfig.resolve.alias, ...aliases };
  mergedConfig.plugins.push(new CheckerPlugin());
  //console.dir(mergedConfig, {depth: null});
  return mergedConfig;
};
