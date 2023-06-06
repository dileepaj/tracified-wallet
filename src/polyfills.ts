import 'zone.js'; // Included with Angular CLI.

declare const global: any;
(window as any).global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;
global.process = require('process');

// Add the resolution code
const path = require('path-browserify');

// Use the path polyfill in case it is not available
if (!global.hasOwnProperty('path')) {
  global.path = path;
}