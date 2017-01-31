'use strict';

const path = require('path');
const jetpack = require('fs-jetpack');
const { rollup } = require('rollup');
const jsx = require('rollup-plugin-jsx');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');

const nodeBuiltInModules = ['assert', 'buffer', 'child_process', 'cluster',
    'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
    'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
    'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
    'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

const electronBuiltInModules = ['electron'];

const generateExternalModulesList = function generateExternalModulesList (pkg) {
  return [].concat(
    nodeBuiltInModules,
    electronBuiltInModules,
    Object.keys(pkg.dependencies),
    Object.keys(pkg.devDependencies)
  );
};

const cached = {};

module.exports = function bundle(src, dest, pkg) {
  return rollup({
    entry: src,
    external: generateExternalModulesList(pkg),
    cache: cached[src],
    plugins: [
      json(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['react', 'es2015-rollup'],
      }),
      jsx({ factory: 'React.createElement' }),
    ],
  })
  .then((bundle) => {
    cached[src] = bundle;
    const jsFile = path.basename(dest);
    const result = bundle.generate({
      format: 'cjs',
      sourceMap: true,
      sourceMapFile: jsFile,
    });
    // Wrap code in self invoking function so the constiables don't
    // pollute the global namespace.
    const isolatedCode = '(function () {' + result.code + '\n}());';
    return Promise.all([
      jetpack.writeAsync(dest, isolatedCode + '\n//# sourceMappingURL=' + jsFile + '.map'),
      jetpack.writeAsync(dest + '.map', result.map.toString()),
    ]);
  });
};
