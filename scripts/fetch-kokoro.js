#!/usr/bin/env node
/*
  Download Kokoro model files for offline use with Transformers.js
  - Target: public/models/Xenova/kokoro-82m/
  - Files: config.json, tokenizer.json, generation_config.json (optional), onnx/model.onnx (or model.onnx)
  - Usage: HF_TOKEN=your_token yarn fetch:kokoro
*/

const fs = require('fs');
const path = require('path');

const REPO = process.env.KOKORO_REPO || 'NeuML/kokoro-int8-onnx';
const BASE = `https://huggingface.co/${REPO}/resolve/main`;
const TARGET_DIR = path.join(process.cwd(), 'public', 'models', ...REPO.split('/'));
const HF_TOKEN = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || '';

const FILES = [
  'config.json',
  'tokenizer.json',
  'generation_config.json',
  // common ONNX paths across repos
  'model.onnx',
  'onnx/model.onnx',
  'decoder/model.onnx',
];

async function download(url, dest) {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });
  const res = await fetch(url, {
    headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
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
    console.warn('\nSome files were not downloaded. If Kokoro fails at runtime, please fetch them manually:');
    for (const m of missing) console.warn(` - ${BASE}/${m}`);
    console.warn(`Destination: ${TARGET_DIR}`);
  } else {
    console.log('\nKokoro model files ready for offline use.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


