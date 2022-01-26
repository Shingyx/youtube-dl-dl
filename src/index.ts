import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { downloadFile, downloadJson, existsAsync } from './utilities';

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

/**
 * Downloads the latest version of `yt-dlp` to the specified directory.
 * The downloaded file will be either `yt-dlp` or `yt-dlp.exe` depending on the platform.
 *
 * If the file already exists, the download will only occur if the existing version is older than
 * the latest version.
 *
 * @param directory Directory to download to.
 * @param logger Progress logger, defaults to console. Provide `null` to disable logging.
 * @returns Promise resolving `true` if the download was attempted and completed,
 *          or `false` if the latest version is already present.
 */
export async function downloadYtDlp(
  directory: string,
  logger: ILogger | null = console,
): Promise<boolean> {
  const ytDlpFilename = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const ytDlpPath = path.join(directory, ytDlpFilename);

  const releaseJsonPromise = downloadJson(
    'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest',
  );

  if (await existsAsync(ytDlpPath)) {
    const installedVersion = await getInstalledVersion(ytDlpPath, logger);
    if (installedVersion && installedVersion === (await releaseJsonPromise).tag_name) {
      logger?.info('yt-dlp is already up to date');
      return false;
    }
    logger?.info('Updating yt-dlp...');
  } else {
    logger?.info('Downloading yt-dlp...');
  }

  const ytDlpUrl = (await releaseJsonPromise).assets.find(
    (asset: any) => asset.name === ytDlpFilename,
  ).browser_download_url;

  await downloadFile(ytDlpUrl, directory);

  if (process.platform !== 'win32') {
    await fs.promises.chmod(ytDlpPath, '755');
  }

  logger?.info('yt-dlp download complete');
  return true;
}

async function getInstalledVersion(
  ytDlpPath: string,
  logger: ILogger | null,
): Promise<string | null> {
  try {
    let execPath = ytDlpPath;
    if (process.platform !== 'win32' && !ytDlpPath.includes('/')) {
      execPath = './' + execPath;
    }
    const { stdout } = await promisify(execFile)(execPath, ['--version']);
    return stdout.trim();
  } catch {
    logger?.error('Failed to read installed yt-dlp version');
    return null;
  }
}
