import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

function makeSvg(size) {
  const pad = size * 0.10
  const r = size * 0.13
  const textSize = size * 0.52
  const shadowOffset = size * 0.025

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- 전체 배경 (투명 영역 없애기) -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="#fef08a"/>

  <!-- 포스트잇 본체 (테두리만) -->
  <rect
    x="${pad}" y="${pad}"
    width="${size - pad * 2}" height="${size - pad * 2}"
    rx="${r}" ry="${r}"
    fill="#fef08a"
  />

  <!-- 윗줄 (노트 느낌) -->
  <line
    x1="${pad * 1.8}" y1="${size * 0.38}"
    x2="${size - pad * 1.8}" y2="${size * 0.38}"
    stroke="#e5d648" stroke-width="${size * 0.018}" stroke-linecap="round"
  />
  <line
    x1="${pad * 1.8}" y1="${size * 0.52}"
    x2="${size - pad * 1.8}" y2="${size * 0.52}"
    stroke="#e5d648" stroke-width="${size * 0.018}" stroke-linecap="round"
  />
  <line
    x1="${pad * 1.8}" y1="${size * 0.66}"
    x2="${size - pad * 1.8}" y2="${size * 0.66}"
    stroke="#e5d648" stroke-width="${size * 0.018}" stroke-linecap="round"
  />

  <!-- Q 텍스트 -->
  <text
    x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Georgia, serif"
    font-size="${textSize}"
    font-weight="bold"
    fill="#7a5c38"
    letter-spacing="-2"
  >Q</text>
</svg>`
}

async function generate(size, filename) {
  const svg = Buffer.from(makeSvg(size))
  await sharp(svg).resize(size, size).png().toFile(path.join(publicDir, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await generate(192, 'icon-192.png')
await generate(512, 'icon-512.png')
await generate(180, 'apple-icon.png')
console.log('아이콘 생성 완료')
