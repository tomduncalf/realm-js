const path = require('path');
const escape = require('escape-string-regexp');
const rootModulePackage = require('../../package.json');

const root = path.resolve(__dirname, '../..');

const conflictingDependencies = Object.keys({
  ...rootModulePackage.peerDependencies,
  ...rootModulePackage.optionalDependencies,
});

// This ensures we do not duplicate multiple versions of the peer dependencies
const blockList = conflictingDependencies.map(
  module =>
    new RegExp(`^${escape(path.join(root, 'node_modules', module))}\\/.*$`),
);

// This includes the peer dependencies of the root library into the bundler
const extraNodeModules = conflictingDependencies.reduce((modules, name) => {
  modules[name] = path.join(__dirname, 'node_modules', name);
  return modules;
}, {});

module.exports = {
  projectRoot: __dirname,
  // This watches for changes in the root library
  watchFolders: [root],

  resolver: {
    blockList,
    extraNodeModules,
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
