#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = process.env.KOKORO_REPO || 'NeuML/kokoro-int8-onnx';
const BASE = `https://huggingface.co/${REPO}/resolve/main`;
const TARGET_DIR = path.join(process.cwd(), 'public', 'models', ...REPO.split('/'));
const HF_TOKEN = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || '';

const FILES = [
  'config.json',
  'tokenizer.json',
  'generation_config.json',
  'model.onnx',
  'onnx/model.onnx',
  'decoder/model.onnx',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const options = new URL(url);
    options.headers = HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {};
    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  const missing = [];
  for (const rel of FILES) {
    const dest = path.join(TARGET_DIR, rel);
    if (fs.existsSync(dest)) continue;
    const url = `${BASE}/${rel}`;
    try {
      await download(url, dest);
      console.log(`Downloaded ${rel}`);
    } catch (e) {
      console.warn(`Skip ${rel}: ${e.message}`);
      missing.push(rel);
    }
  }
  if (missing.length) {
    console.warn('\nSome files were not downloaded. Fetch manually if needed:');
    for (const m of missing) console.warn(` - ${BASE}/${m}`);
    console.warn(`Destination: ${TARGET_DIR}`);
  } else {
    console.log('\nKokoro model files ready for offline use.');
  }
})().catch((e) => { console.error(e); process.exit(1); });


