#!/usr/bin/env node

var optimist = require('optimist');
var confirm = require('../lib/confirm');

var argv = optimist
  .usage("Command line confirmation tool")
  .describe('version', 'Print the current version number')
  .describe('help', 'Show this help message')
  .alias('version', 'v')
  .alias('help', 'h')
  .argv;

if (argv.help) {
  console.log(optimist.help());
  return;
}

if (argv.version) {
  console.log(require('../package.json').version);
  return;
}

confirm({
  positive: 'yes',
  negative: 'no',
  query: 'Confirm by typing "yes", abort by typing "no":'
}, function(err, result) {
  var ok = !err && result;
  process.exit(ok ? 0 : 1);
});
