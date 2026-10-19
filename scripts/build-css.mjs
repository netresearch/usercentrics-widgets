// Minifies style/ucw.css into dist/ucw.min.css with the clean-css API.
// Replaces `cleancss -o ./dist/ucw.min.css ./style/ucw.css` and passes the
// options that clean-css-cli 5.x derives for that invocation, so the output
// is unchanged.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import process from 'node:process';
import CleanCSS from 'clean-css';

const input = './style/ucw.css';
const output = './dist/ucw.min.css';

const result = new CleanCSS({
  inline: 'local',
  level: { 1: true },
  rebase: false
}).minify([input]);

result.warnings.forEach(message => console.error('WARNING: %s', message));
result.errors.forEach(message => console.error('ERROR: %s', message));

if (result.errors.length > 0) {
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, result.styles, 'utf8');
