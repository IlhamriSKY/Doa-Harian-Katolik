const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/extension.js',
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.bundle.js',
    },
    externals: [nodeExternals(), 'vscode'],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
};
