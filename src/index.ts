import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { downloadFile, downloadJson } from './utilities';

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

export async function downloadYouTubeDl(
  directory: string = '.',
  logger: ILogger = console,
): Promise<void> {
  const youTubeDlFilename = 'youtube-dl.exe';
  const youTubeDlPath = path.join(directory, 'youtube-dl.exe');

  const releaseJsonPromise = downloadJson(
    'https://api.github.com/repos/ytdl-org/youtube-dl/releases/latest',
  );

  if (fs.existsSync(youTubeDlPath)) {
    const installedVersion = getInstalledVersion(youTubeDlPath, logger);
    if (installedVersion && installedVersion === (await releaseJsonPromise).tag_name) {
      logger.info('youtube-dl is already up to date');
      return;
    }
    logger.info('Updating youtube-dl...');
  } else {
    logger.info('Downloading youtube-dl...');
  }

  const youTubeDlUrl = (await releaseJsonPromise).assets.find(
    (asset: any) => asset.name === youTubeDlFilename,
  ).browser_download_url;

  await downloadFile(youTubeDlUrl, '.');

  logger.info('youtube-dl download complete');
}

async function getInstalledVersion(youTubeDlPath: string, logger: ILogger): Promise<string | null> {
  try {
    const { stdout } = await promisify(execFile)(youTubeDlPath, ['--version']);
    return stdout.trim();
  } catch {
    logger.error('Failed to read installed youtube-dl version');
    return null;
  }
}
