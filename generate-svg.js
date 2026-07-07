/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const b64 = fs.readFileSync('public/logo.png', 'base64');
const svg = `<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <clipPath id='rounded'>
      <rect x='0' y='0' width='512' height='512' rx='256' ry='256' />
    </clipPath>
  </defs>
  <image href='data:image/png;base64,${b64}' x='0' y='0' width='512' height='512' clip-path='url(#rounded)' />
</svg>`;
fs.writeFileSync('src/app/icon.svg', svg);
try {
  fs.unlinkSync('src/app/icon.png');
} catch(e) {}
