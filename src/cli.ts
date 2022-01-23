#!/usr/bin/env node
import { downloadYtDlp } from '.';

const [directoryArg] = process.argv.slice(2);

const directory = directoryArg || '.';

downloadYtDlp(directory).catch((e) => {
  console.error('Downloading yt-dlp failed', e);
  process.exit(1);
});
