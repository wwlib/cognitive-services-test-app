import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './css/bootstrap.min.css';
import './css/font-awesome.min.css';
import './css/style.css'; // florence app global css

import App from './App';
import * as serviceWorker from './serviceWorker';
import Model from './model/Model';

// Define Resampler globally
require('./js/resampler_node.js');

declare const global: {
  Resampler: any;
}
// console.log(`global.Resampler:`, global.Resampler);

const model: Model = new Model();

console.log(`process.env: `, process.env);
if (process.env.REACT_APP_MODE === 'electron') {
    console.log(`Running in Electron: Filesystem access is enabled.`)
}

for (const type of ['chrome', 'node', 'electron']) {
  console.log(`${type}-version`, process.versions[type]);
}


ReactDOM.render(<App model={model}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
