/* eslint no-console: 0 */
import jetpack from 'fs-jetpack';
import appConfig from './config/default';
import pkg from '../package.json';

const defaultSettings = Object.assign(appConfig, {
  version: pkg.version,
  name: pkg.name,
  productName: pkg.productName,
  description: pkg.description,
  repository: pkg.repository.url,
  authorUrl: pkg.author.url,
  authorName: pkg.author.name,
});

const configs = ['production', 'development', 'test'].reduce((memo, key) =>
  Object.assign(memo, {
    [key]: Object.assign({ env: key }, defaultSettings),
  }),
{});

export default function getConfig(env = 'development') {
  const envConfig = configs[env];
  if (!envConfig) {
    throw new Error(`${env} is not a valid environment`);
  }
  console.log('\nENVIRONMENT\n------------------');
  console.log(envConfig);
  console.log('\n');
  return envConfig;
}
