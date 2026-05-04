import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const src = '/Users/jeong-eunchae/.claude/image-cache/d13b7b50-5985-4473-8c32-7b2452fd73d9/7.png'

// 흰 배경 제거, 로고 영역만 크롭
async function generate(size, filename) {
  await sharp(src)
    .extract({ left: 282, top: 50, width: 460, height: 460 })
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await generate(512, 'icon-512.png')
await generate(192, 'icon-192.png')
await generate(180, 'apple-icon.png')
console.log('아이콘 생성 완료')
