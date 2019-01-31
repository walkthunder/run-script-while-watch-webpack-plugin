'use strict';
const cp = require('child_process');
let server;

function RunScriptWhileWatchPlugin(options) {
  var defaultOptions = {
    name: 'run-script-while-watch-plugin',
    onBuildEnd: []
  };

  this.options = Object.assign(defaultOptions, options);
}


function runServer(scriptPath) {
  function onStdOut(data) {
    const time = new Date().toTimeString();
    process.stdout.write(time.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '[$1] '));
    process.stdout.write(data);
  }

  if (server) {
    server.kill('SIGTERM');
  }

  server = cp.spawn('node', [scriptPath, '--display-error-details'], {
    env: { NODE_ENV: 'development', ...process.env },
    silent: false
  })
  server.stdout.on('data', onStdOut);
  server.stderr.on('data', err => process.stderr.write(err));
}

RunScriptWhileWatchPlugin.prototype.apply = function(compiler) {
  const options = this.options;

  compiler.hooks.afterEmit.tap(options, () => {
    if(options.onBuildEnd.length){
        options.onBuildEnd.forEach(runServer);
    }
  });
};

module.exports = RunScriptWhileWatchPlugin;