// יצירת אייקוני PWA (ללא תלות חיצונית) — רקע ירוק עם עיגול זהוב ושיבולת
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
function png(size, draw) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit, RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size)
  let o = 0
  for (let y = 0; y < size; y++) {
    raw[o++] = 0 // filter none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size)
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a
    }
  }
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }))
  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, chunk('IEND', Buffer.alloc(0))])
}

const GREEN = [31, 122, 77]
const GREEN_D = [21, 92, 57]
const GOLD = [196, 154, 38]
const CREAM = [250, 247, 240]

function draw(x, y, s) {
  const cx = s / 2, cy = s / 2
  const dx = x - cx, dy = y - cy
  const d = Math.sqrt(dx * dx + dy * dy)
  // רקע מדורג
  let col = y < cy ? GREEN : GREEN_D
  // עיגול זהוב
  if (d < s * 0.34) col = GOLD
  if (d < s * 0.30) col = CREAM
  // גבעול שיבולת פשוט במרכז
  const stalkW = s * 0.03
  if (Math.abs(dx) < stalkW && y > cy - s * 0.18 && y < cy + s * 0.20) col = GREEN_D
  // גרגרי שיבולת
  for (let k = -2; k <= 2; k++) {
    const gy = cy - s * 0.16 + k * s * 0.07
    const gx = cx + (k % 2 === 0 ? 1 : -1) * s * 0.05
    if (Math.hypot(x - gx, y - gy) < s * 0.035) col = GREEN
  }
  return [col[0], col[1], col[2], 255]
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', png(192, draw))
writeFileSync('public/icon-512.png', png(512, draw))
console.log('icons written')
