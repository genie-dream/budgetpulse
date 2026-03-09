// scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdir } from 'fs/promises'

await mkdir('public/icons', { recursive: true })

// SVG icon: dark background, blue accent circle, white pulse wave symbol
const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0F172A"/>
  <!-- Blue outer glow circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.38}" fill="#1E40AF" opacity="0.3"/>
  <!-- Blue main circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.32}" fill="#3B82F6"/>
  <!-- White pulse wave (W shape representing "Pulse") -->
  <polyline
    points="${size*0.22},${size*0.5} ${size*0.33},${size*0.35} ${size*0.42},${size*0.58} ${size*0.5},${size*0.38} ${size*0.58},${size*0.62} ${size*0.67},${size*0.42} ${size*0.78},${size*0.5}"
    fill="none"
    stroke="white"
    stroke-width="${size * 0.04}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`

await sharp(Buffer.from(createSvg(192))).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(createSvg(512))).png().toFile('public/icons/icon-512.png')
console.log('Icons generated: public/icons/icon-192.png, public/icons/icon-512.png')
