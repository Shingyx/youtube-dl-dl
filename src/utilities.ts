import fs from 'fs';
import fetch, { Response } from 'node-fetch';
import path from 'path';

export async function downloadJson(url: string): Promise<any> {
  const response = await wrappedFetch(url);
  return response.json();
}

export async function downloadFile(url: string, pathPrefix: string): Promise<string> {
  const response = await wrappedFetch(url);
  const buffer = await response.buffer();
  const filename = path.join(pathPrefix, extractFilename(url));
  await fs.promises.writeFile(filename, buffer);
  return filename;
}

async function wrappedFetch(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed, status code: ${response.status}`);
  }
  return response;
}

function extractFilename(text: string): string {
  const result = /[^/]*$/.exec(text);
  return result ? result[0] : text;
}
