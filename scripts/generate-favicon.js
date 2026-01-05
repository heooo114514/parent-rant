const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  // Create a more "rant" style icon - a speech bubble with an exclamation mark or angry face
  // Using SVG for generation
  const svg = `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="60" fill="url(#grad)" />
      <path d="M128 64c-44.18 0-80 35.82-80 80 0 44.18 35.82 80 80 80 13.8 0 26.8-3.6 38.2-10l41.8 22-11-37.4c22.6-14.6 37-39.6 37-64.6 0-44.18-35.82-80-80-80z" fill="white" opacity="0.2"/>
      <path d="M78 88h20v20H78zm40 0h20v20h-20zm40 0h20v20h-20zM78 148h100v20H78z" fill="white"/>
      <text x="128" y="170" font-family="Arial, sans-serif" font-size="140" font-weight="bold" fill="white" text-anchor="middle">!</text>
    </svg>
  `;

  const publicDir = path.join(__dirname, '../src/app');
  const buffer = Buffer.from(svg);

  // Generate favicon.ico (32x32)
  await sharp(buffer)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Favicon generated successfully!');
}

generateFavicon().catch(console.error);