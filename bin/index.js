#!/usr/bin/env node
const args = process.argv.slice(2);

import { fileURLToPath } from 'url';
import { Plop, run } from "plop/src/plop.js";
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Plop.prepare(
  {
    cwd: process.cwd(),
    preload: [],
    configPath: path.resolve(__dirname, '../plopfile.js'),
  },
  function (env) {
    Plop.execute(env, run);
  }
);
