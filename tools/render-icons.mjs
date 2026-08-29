import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const chrome = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(repo, 'assets', 'icon.svg');
const splashDirectory = path.join(repo, 'assets', 'splash');
const outputs = [
  ['icon-192.png', 192, 'any'],
  ['icon-512.png', 512, 'any'],
  ['icon-192-maskable.png', 192, 'maskable'],
  ['icon-512-maskable.png', 512, 'maskable'],
  ['badge-96.png', 96, 'badge'],
];

function splashIconSize(width) {
  if (width >= 1500) return 320;
  if (width >= 1100) return 240;
  return 160;
}

function runChrome(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => code === 0
      ? resolve()
      : reject(new Error(`Chrome exited with code ${code}: ${stderr.trim()}`)));
  });
}

function pngInfo(buffer) {
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG', 'Expected a PNG signature');
  assert.equal(buffer.subarray(12, 16).toString('ascii'), 'IHDR', 'Expected IHDR as the first PNG chunk');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colourType: buffer[25],
  };
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  return leftDistance <= upDistance && leftDistance <= upperLeftDistance
    ? left
    : upDistance <= upperLeftDistance ? up : upperLeft;
}

function forceRgba(buffer) {
  const info = pngInfo(buffer);
  if (info.colourType === 6) return buffer;
  assert.equal(info.colourType, 2, 'Expected an RGB or RGBA Chrome screenshot');
  assert.equal(buffer[24], 8, 'Expected an 8-bit PNG');
  assert.equal(buffer[28], 0, 'Expected a non-interlaced PNG');

  const idat = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }

  const filtered = inflateSync(Buffer.concat(idat));
  const stride = info.width * 3;
  const rgb = Buffer.alloc(stride * info.height);
  for (let y = 0; y < info.height; y++) {
    const sourceRow = y * (stride + 1);
    const targetRow = y * stride;
    const filter = filtered[sourceRow];
    for (let x = 0; x < stride; x++) {
      const left = x >= 3 ? rgb[targetRow + x - 3] : 0;
      const up = y ? rgb[targetRow + x - stride] : 0;
      const upperLeft = y && x >= 3 ? rgb[targetRow + x - stride - 3] : 0;
      const predictor = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, upperLeft)][filter];
      assert.notEqual(predictor, undefined, `Unsupported PNG filter ${filter}`);
      rgb[targetRow + x] = (filtered[sourceRow + x + 1] + predictor) & 255;
    }
  }

  const rgbaRows = Buffer.alloc((info.width * 4 + 1) * info.height);
  for (let y = 0; y < info.height; y++) {
    const row = y * (info.width * 4 + 1);
    for (let x = 0; x < info.width; x++) {
      const rgbOffset = (y * info.width + x) * 3;
      const rgbaOffset = row + 1 + x * 4;
      rgb.copy(rgbaRows, rgbaOffset, rgbOffset, rgbOffset + 3);
      rgbaRows[rgbaOffset + 3] = 255;
    }
  }

  const ihdr = Buffer.from(buffer.subarray(16, 29));
  ihdr[9] = 6;
  return Buffer.concat([
    buffer.subarray(0, 8),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(rgbaRows)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const svg = await readFile(source, 'utf8');
const scratch = await mkdtemp(path.join(tmpdir(), 'fittrack-icons-'));

try {
  for (const [filename, size, variant] of outputs) {
    const renderedSvg = svg.replace('data-variant="any"', `data-variant="${variant}"`);
    const html = `<!doctype html><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${renderedSvg}`;
    const page = path.join(scratch, `${variant}-${size}.html`);
    const output = path.join(repo, filename);
    await writeFile(page, html);
    await runChrome([
      '--headless',
      '--disable-gpu',
      '--disable-gpu-sandbox',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--screenshot=${output}`,
      `--window-size=${size},${size}`,
      '--default-background-color=00000000',
      pathToFileURL(page).href,
    ]);

    let buffer = await readFile(output);
    buffer = forceRgba(buffer);
    await writeFile(output, buffer);
    const info = pngInfo(buffer);
    assert.deepEqual([info.width, info.height], [size, size], `${filename} has the wrong dimensions`);
    assert.equal(info.colourType, 6, `${filename} is not RGBA`);
    console.log(`${filename}\t${(await stat(output)).size} bytes\t${info.width}x${info.height}\tcolour type ${info.colourType}`);
  }

  const splashFiles = (await readdir(splashDirectory))
    .filter(filename => /^apple-splash-.*\.png$/.test(filename))
    .sort();
  assert.equal(splashFiles.length, 10, 'Expected the existing 10 Apple splash screens');

  for (const filename of splashFiles) {
    const output = path.join(splashDirectory, filename);
    const currentInfo = pngInfo(await readFile(output));
    const iconSize = splashIconSize(currentInfo.width);
    const html = `<!doctype html><style>html,body{margin:0;width:${currentInfo.width}px;height:${currentInfo.height}px;overflow:hidden;background:#000}body{display:grid;place-items:center}svg{display:block;width:${iconSize}px;height:${iconSize}px}</style>${svg}`;
    const page = path.join(scratch, filename.replace(/\.png$/, '.html'));
    await writeFile(page, html);
    await runChrome([
      '--headless',
      '--disable-gpu',
      '--disable-gpu-sandbox',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--screenshot=${output}`,
      `--window-size=${currentInfo.width},${currentInfo.height}`,
      '--default-background-color=000000',
      pathToFileURL(page).href,
    ]);

    let buffer = await readFile(output);
    buffer = forceRgba(buffer);
    await writeFile(output, buffer);
    const info = pngInfo(buffer);
    assert.deepEqual([info.width, info.height], [currentInfo.width, currentInfo.height], `${filename} has the wrong dimensions`);
    assert.equal(info.colourType, 6, `${filename} is not RGBA`);
    console.log(`${path.join('assets', 'splash', filename)}\t${(await stat(output)).size} bytes\t${info.width}x${info.height}\tcolour type ${info.colourType}\t${iconSize}px icon`);
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}
