import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const src = '/Users/jeong-eunchae/.claude/image-cache/d13b7b50-5985-4473-8c32-7b2452fd73d9/2.png'

// 검정 바 제거 → 일러스트 전체(Q + 주변 장식)를 노트 배경색으로 패딩해 정사각형
async function generate(size, filename) {
  await sharp(src)
    .extract({ left: 0, top: 10, width: 474, height: 840 }) // 검정 바 제거, 일러스트 전체
    .resize(size, size, { fit: 'contain', background: { r: 254, g: 249, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await generate(512, 'icon-512.png')
await generate(192, 'icon-192.png')
await generate(180, 'apple-icon.png')
console.log('아이콘 생성 완료')
