/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const usage = `Cara pakai:
  node save_image.js out.png        lalu PASTE gambar di terminal, tekan Enter/Ctrl+D
  node save_image.js input.png out.png   (kalau sudah punya file PNG di disk)`;

const args = process.argv.slice(2);
let outName, input;

if (args.length === 1) {
  [outName] = args;
} else if (args.length === 2) {
  [input, outName] = args;
} else {
  console.log(usage);
  process.exit(0);
}

outName = path.resolve(outName);

if (input) {
  outName = convert(path.resolve(input), outName);
  console.log('Tersimpan:', outName);
  process.exit(0);
}

console.log('Menunggu paste gambar... (tekan Ctrl+D / Enter lalu Ctrl+D kalau di Windows)');

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  try {
    const buf = Buffer.concat(chunks);
    // Kalau yang di-paste ternyata path/URL file, convert itu
    if (!buf.length) {
      console.error('Tidak ada data paste.');
      process.exit(1);
    }
    const s = buf.toString('latin1');
    const m = s.match(/[\x20-\x7e\/\\:._-]+\.(?:png|jpe?g|webp|gif|bmp)/i);
    if (m && !s.slice(0, 5000).includes('IHDR')) {
      console.log('Paste terdeteksi sebagai path/file text:', m[0]);
      outName = convert(m[0], outName);
      console.log('Tersimpan:', outName);
      process.exit(0);
    }
    // PNG absolute-base64 dump?
    const b64 = buf.toString('utf8');
    if (/^[A-Za-z0-9+/=\s]+$/.test(b64) && b64.length > 200) {
      const b = Buffer.from(b64, 'base64');
      if (b.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
        fs.writeFileSync(outName, b);
        console.log('Tersimpan (base64):', outName,getSize(b));
        process.exit(0);
      }
    }
    if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
      fs.writeFileSync(outName, buf);
      console.log('Tersimpan (binary PNG):', outName, getSize(buf));
      process.exit(0);
    }
    console.error('Data tidak dikenal sebagai PNG. Coba pakai cara save manual atau kirim file langsung.', buf.slice(0, 32));
    process.exit(1);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

function convert(src, out) {
  const buf = fs.readFileSync(src);
  return write(buf, out);
}

function write(buf, out) {
  if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    fs.writeFileSync(out, buf);
    return out;
  }
  console.error('File bukan PNG:', buf.slice(0, 12));
  process.exit(1);
}

function getSize(b) {
  return `${b.length} bytes`;
}
