'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'app/ui5/webapp');
const targetRoot = path.join(projectRoot, 'gen/production');

function copyUiToProduction(outputRoot = targetRoot, source = sourceRoot) {
  const resolvedOutput = path.resolve(outputRoot);
  const resolvedSource = path.resolve(source);
  const destination = path.resolve(resolvedOutput, 'app/ui5/webapp');
  const relativeDestination = path.relative(resolvedOutput, destination);
  if (!relativeDestination || relativeDestination.startsWith('..') || path.isAbsolute(relativeDestination)) {
    throw new Error('UI production copy destination must remain below the build output root');
  }
  if (!fs.statSync(resolvedSource).isDirectory()) throw new Error('UI source folder is not a directory');

  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(resolvedSource, destination, { recursive: true });
  return destination;
}

if (require.main === module) copyUiToProduction();

module.exports = { copyUiToProduction };
