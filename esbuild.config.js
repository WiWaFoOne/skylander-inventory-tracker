const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: { '.js': 'jsx' }, // This is the important line
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  sourcemap: true,
  watch: true,
}).catch(() => process.exit(1));
