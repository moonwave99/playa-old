import jsx from 'rollup-plugin-jsx';
import babel from 'rollup-plugin-babel';
import jetpack from 'fs-jetpack';

const nodeBuiltInModules = ['assert', 'buffer', 'child_process', 'cluster',
    'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
    'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
    'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
    'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

const electronBuiltInModules = ['electron'];

const generateExternalModulesList = function () {
    const appManifest = jetpack.read('./package.json', 'json');
    return [].concat(
        nodeBuiltInModules,
        electronBuiltInModules,
        Object.keys(appManifest.dependencies),
        Object.keys(appManifest.devDependencies)
    );
};

export default {
  dest: 'build/browser.js',
  entry: 'src/browser/main.js',
  external: generateExternalModulesList(),
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: ['react', 'es2015-rollup'],
    }),
    jsx({ factory: 'React.createElement' }),
  ],
  sourceMap: true,
};
