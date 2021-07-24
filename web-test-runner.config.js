const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  nodeResolve: true,
  concurrency: 1,
  plugins: [
    esbuildPlugin({ ts: true })
  ]
};
