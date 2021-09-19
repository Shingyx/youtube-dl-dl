import { execFile } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

import { downloadFile, downloadJson } from './utilities';

export async function downloadYouTubeDl(): Promise<void> {
  const youTubeDlFilename = 'youtube-dl.exe';

  const releaseJsonPromise = downloadJson(
    'https://api.github.com/repos/rg3/youtube-dl/releases/latest',
  );

  if (fs.existsSync(youTubeDlFilename)) {
    const installedVersion = getInstalledVersion(youTubeDlFilename);
    if (installedVersion && installedVersion === (await releaseJsonPromise).tag_name) {
      console.log('youtube-dl is already up to date');
      return;
    }
    console.log('Updating youtube-dl...');
  } else {
    console.log('Downloading youtube-dl...');
  }

  const youTubeDlUrl = (await releaseJsonPromise).assets.find(
    (asset: any) => asset.name === youTubeDlFilename,
  ).browser_download_url;

  await downloadFile(youTubeDlUrl, '.');

  console.log('youtube-dl download complete');
}

async function getInstalledVersion(youTubeDlPath: string): Promise<string | null> {
  try {
    const { stdout } = await promisify(execFile)(youTubeDlPath, ['--version']);
    return stdout.trim();
  } catch {
    console.error('Failed to read installed youtube-dl version');
    return null;
  }
}
