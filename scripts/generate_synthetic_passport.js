#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'sample-data');
fs.mkdirSync(outputDir, { recursive: true });

function createSvg(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250">\n  <rect width="100%" height="100%" fill="#ffffff"/>\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#888888">${text}</text>\n</svg>\n`;
}

const samples = [
  `P<UTODEMO<<ALPHA<PASSPORT<<<<<<<<<<<<<<<<\nL0000000<0UTO0000000M0000000<<<<<<<<<<<<<<00`,
  `P<UTODEMO<<BETA<PASSPORT<<<<<<<<<<<<<<<<<\nL1111111<1UTO1111111F1111111<<<<<<<<<<<<<<00`,
  `P<UTODEMO<<GAMMA<PASSPORT<<<<<<<<<<<<<<<<\nL2222222<2UTO2222222M2222222<<<<<<<<<<<<<<00`
];

samples.forEach((mrz, idx) => {
  const index = idx + 1;
  fs.writeFileSync(path.join(outputDir, `sample_${index}.mrz`), mrz);
  const svg = createSvg('Synthetic Sample');
  fs.writeFileSync(path.join(outputDir, `sample_${index}.svg`), svg);
});

console.log(`Generated ${samples.length} synthetic samples in ${outputDir}`);
