import { app } from 'electron';
import path from 'path';
import fs from 'fs-plus';
import yargs from 'yargs';
import Application from './application';

const shellStartTime = Date.now();

process.on('uncaughtException', (error = {}) => {
  if (error.message !== null) {
    console.log(error.message); // eslint-disable-line
  }
  if (error.stack !== null) {
    console.log(error.stack); // eslint-disable-line
  }
});

const parseCommandLine = function parseCommandLine() {
  let resourcePath = null;
  const version = app.getVersion();
  yargs
    .alias('d', 'dev')
      .boolean('d')
      .describe('d', 'Run in development mode.')
    .alias('h', 'help')
      .boolean('h')
      .describe('h', 'Print this usage message.')
    .alias('l', 'log-file')
      .string('l')
      .describe('l', 'Log all output to file.')
    .alias('r', 'resource-path')
      .string('r')
      .describe('r', 'Set the path to the App source directory and enable dev-mode.')
    .alias('t', 'test')
      .boolean('t')
      .describe('t', 'Run the specified specs and exit with error code on failures.')
    .alias('v', 'version')
      .boolean('v')
      .describe('v', 'Print the version.');

  const args = yargs.parse(process.argv.slice(1));
  process.stdout.write(`${JSON.stringify(args)}\n`);
  if (args.help) {
    let help = '';
    yargs.showHelp((s) => { help += s; });
    process.stdout.write(`${help}\n`);
    process.exit(0);
  }
  if (args.version) {
    process.stdout.write(`${version}\n`);
    process.exit(0);
  }
  let devMode = args.dev;
  const test = args.test;
  const exitWhenDone = test;
  const logFile = args['log-file'];
  if (args['resource-path']) {
    devMode = true;
    resourcePath = args['resource-path'];
    if (devMode) {
      if (resourcePath == null) {
        resourcePath = global.devResourcePath;
      }
    }
  }
  if (!fs.statSyncNoException(resourcePath)) {
    resourcePath = path.join(process.resourcesPath, 'app.asar');
  }
  resourcePath = path.resolve(resourcePath);
  return {
    resourcePath,
    devMode,
    test,
    exitWhenDone,
    logFile,
  };
};

const start = function start() {
  app.commandLine.appendSwitch('js-flags', '--harmony');
  const args = parseCommandLine();
  if (args.devMode) {
    app.commandLine.appendSwitch('remote-debugging-port', '8315');
  }
  app.on('ready', () => {
    global.application = new Application(args);
    if (!args.test) {
      console.log(`App load time: ${(Date.now() - shellStartTime)}ms`); // eslint-disable-line
    }
  });
};

start();
