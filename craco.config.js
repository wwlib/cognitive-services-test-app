/**
Note: @google/cloud-speech will not work with webpack. 
Instead: `craco.config.js`vexcludes all node modules from the webpack build, 
including @google/cloud-speech. This makesvthe build much faster and is fine for the electron version.
For the Web it may be fine to exclude just @google/cloud-speech and the use environment
variables to disable cloud-speech features - like using google ASR to get word timings.
**/

const  nodeExternals = require('webpack-node-externals');

let target = 'web';
let externals = [];

if (process.env.REACT_APP_MODE === 'electron') {
  target = 'electron-renderer';
  externals = [nodeExternals()];
}
console.log(`craco.config.js: setting webpack target to: ${target}`);

module.exports = {
  webpack: {
    configure: {
      target: target,
      externals: externals,
      node: {
        __dirname: true,
        __filename: false
      }
    }
  }
};
