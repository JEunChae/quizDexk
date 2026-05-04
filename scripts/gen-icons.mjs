import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const src = '/Users/jeong-eunchae/.claude/image-cache/d13b7b50-5985-4473-8c32-7b2452fd73d9/1.png'

// 검정 바 제거 후 Q 그림 영역만 크롭 → 정사각형으로 리사이즈
async function generate(size, filename) {
  await sharp(src)
    .extract({ left: 0, top: 45, width: 474, height: 800 }) // 검정 바 제거
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(publicDir, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await generate(512, 'icon-512.png')
await generate(192, 'icon-192.png')
await generate(180, 'apple-icon.png')
console.log('아이콘 생성 완료')
