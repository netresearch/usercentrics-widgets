import babel from '@rollup/plugin-babel';
import strip from '@rollup/plugin-strip';
import polyfill from 'rollup-plugin-polyfill';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

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
      copy({
        targets: [
          {
            src: 'src/config/ucw.config.example.js',
            dest: 'dist',
            rename: 'ucw.config.js'
          }
        ],
        hook: 'writeBundle',
        copyOnce: true
      })
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
