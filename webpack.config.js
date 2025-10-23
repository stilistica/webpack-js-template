const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const devMode = mode === "development";

const target = devMode ? "web" : "browserslist";
const devtool = devMode ? "source-map" : undefined;

module.exports = {
  mode,
  target,
  devtool,
  entry: path.resolve(__dirname, "src", "js", "main.js"),
  output: {
    path: path.resolve(__dirname, "docs"),
    clean: true,
    filename: "js/[name].js",
    assetModuleFilename: "assets/[name][ext]",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "pages", "index.html"),
      filename: "index.html",
    }),
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, 'src', 'pages', 'index.html'),
    //   filename: "index.html",
    // }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ["mozjpeg", { quality: 75 }],
            ["optipng", { optimizationLevel: 5 }],
            ["webp", { quality: 70 }],
          ],
        },
      },
      generator: [
        {
          preset: "webp",
          implementation: ImageMinimizerPlugin.imageminGenerate,
          filename: (pathData) => {
            const filepath = path
              .dirname(
                path.relative(
                  path.resolve(__dirname, "src/img"),
                  pathData.filename
                )
              )
              .split(path.sep)
              .join("/");
            return `img/${filepath}/[name].webp`;
          },
          options: {
            plugins: [["webp", { quality: 70 }]],
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: [
          {
            loader: "html-loader",
            // options: { sources: true },
          },
          {
            loader: "posthtml-loader",
            options: {
              plugins: [
                require("posthtml-include")({
                  root: path.resolve(__dirname, "src"),
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.(c|sa|sc)ss$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("postcss-preset-env")],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            targets: "defaults",
            presets: [["@babel/preset-env"]],
          },
        },
      },
      {
        test: /\.woff2?$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /\.(jpe?g|png|webp|gif|svg|ico)?$/i,
        type: "asset/resource",
        generator: {
          filename: (pathData) => {
            const filepath = path
              .dirname(
                path.relative(
                  path.resolve(__dirname, "src/img"),
                  pathData.filename
                )
              )
              .split(path.sep)
              .join("/");
            return `img/${filepath}/[name][ext]`;
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "docs"),
    },
    open: true,
    hot: true,
    watchFiles: ["src/pages/**/*.html"],
    // port: 8080,
  },
  optimization: {
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
};
