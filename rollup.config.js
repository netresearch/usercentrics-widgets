import babel from '@rollup/plugin-babel';
import strip from '@rollup/plugin-strip';
import polyfill from 'rollup-plugin-polyfill';
import terser from '@rollup/plugin-terser';
import { copyFile, mkdir } from 'node:fs/promises';

// Copies the example config into dist/ once, after the first bundle is
// written; this replaces rollup-plugin-copy with the same mapping.
const copyConfigExample = () => {
  let copied = false;

  return {
    name: 'copy-config-example',
    async writeBundle () {
      if (copied) {
        return;
      }
      await mkdir('dist', { recursive: true });
      await copyFile('src/config/ucw.config.example.js', 'dist/ucw.config.js');
      copied = true;
    }
  };
};

export default commandLineArgs => [
  // modern browsers
  {
    input: 'src/main.js',
    output: {
      file: 'dist/ucw.js',
      format: 'iife'
    },
    plugins: [
      !commandLineArgs.configDebug
        ? strip({
          functions: ['console.*']
        })
        : undefined,
      babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/env',
            {
              targets: 'defaults, not IE 11'
            }
          ]
        ]
      }),
      terser(),
      copyConfigExample()
    ]
  },
  // old browsers
  {
    input: 'src/main.js',
    output: {
      file: 'dist/ucw.legacy.js',
      format: 'iife'
    },
    external: ['./replaceWith.js'],
    plugins: [
      !commandLineArgs.configDebug
        ? strip({
          functions: ['console.*']
        })
        : undefined,
      polyfill(['./replaceWith.js']),
      babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/env',
            {
              targets: {
                ie: '11'
              }
            }
          ]
        ]
      }),
      terser()
    ]
  }
];
