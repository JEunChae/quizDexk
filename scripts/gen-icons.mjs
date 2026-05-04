import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const src = '/Users/jeong-eunchae/.claude/image-cache/d13b7b50-5985-4473-8c32-7b2452fd73d9/5.png'

// VOCABULARY Q 헤더 + Q 전체 크롭, 노트 배경색으로 패딩해 정사각형
async function generate(size, filename) {
  await sharp(src)
    .extract({ left: 0, top: 22, width: 474, height: 660 })
    .resize(size, size, { fit: 'contain', background: { r: 245, g: 240, b: 225, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await generate(512, 'icon-512.png')
await generate(192, 'icon-192.png')
await generate(180, 'apple-icon.png')
console.log('아이콘 생성 완료')
