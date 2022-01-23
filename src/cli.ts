#!/usr/bin/env node
import { downloadYouTubeDl } from '.';

const [directoryArg] = process.argv.slice(2);

const directory = directoryArg || '.';

downloadYouTubeDl(directory).catch((e) => {
  console.error('Downloading youtube-dl failed', e);
  process.exit(1);
});
