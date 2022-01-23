import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { downloadFile, downloadJson } from './utilities';

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

export async function downloadYtDlp(directory: string, logger: ILogger = console): Promise<void> {
  const ytDlpFilename = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const ytDlpPath = path.join(directory, ytDlpFilename);

  const releaseJsonPromise = downloadJson(
    'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest',
  );

  if (fs.existsSync(ytDlpPath)) {
    const installedVersion = await getInstalledVersion(ytDlpPath, logger);
    if (installedVersion && installedVersion === (await releaseJsonPromise).tag_name) {
      logger.info('yt-dlp is already up to date');
      return;
    }
    logger.info('Updating yt-dlp...');
  } else {
    logger.info('Downloading yt-dlp...');
  }

  const ytDlpUrl = (await releaseJsonPromise).assets.find(
    (asset: any) => asset.name === ytDlpFilename,
  ).browser_download_url;

  await downloadFile(ytDlpUrl, directory);

  if (process.platform !== 'win32') {
    await fs.promises.chmod(ytDlpPath, '755');
  }

  logger.info('yt-dlp download complete');
}

async function getInstalledVersion(ytDlpPath: string, logger: ILogger): Promise<string | null> {
  try {
    let execPath = ytDlpPath;
    if (process.platform !== 'win32' && !ytDlpPath.includes('/')) {
      execPath = './' + execPath;
    }
    const { stdout } = await promisify(execFile)(execPath, ['--version']);
    return stdout.trim();
  } catch {
    logger.error('Failed to read installed yt-dlp version');
    return null;
  }
}
