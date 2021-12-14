import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  concurrency: 1,
  plugins: [
    esbuildPlugin({ ts: true })
  ]
};
