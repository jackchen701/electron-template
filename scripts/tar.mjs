#!/usr/bin/env node
/**
 * scripts/tar.mjs
 *
 * Cross-platform tar.gz packager for Electron release artifacts.
 * Pure Node.js — no shell `tar` command, no npm packages required.
 *
 * Usage:
 *   node scripts/tar.mjs win|mac|linux
 *
 * Or via npm scripts:
 *   npm run tar:win
 *   npm run tar:mac
 *   npm run tar:linux
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

// ── Config ───────────────────────────────────────────────────────────────────

const PLATFORM = process.argv[2]
if (!['win', 'mac', 'linux'].includes(PLATFORM)) {
  console.error('Usage: node scripts/tar.mjs win|mac|linux')
  process.exit(1)
}

const VERSION     = pkg.version
const PRODUCT     = (pkg.productName || pkg.name).replace(/\s+/g, '-')
const RELEASE_DIR = path.resolve(`release/${VERSION}`)
const OUT_FILE    = path.join(RELEASE_DIR, `${PRODUCT}-${VERSION}-${PLATFORM}.tar.gz`)

/** File matchers per platform */
const PLATFORM_PATTERNS = {
  win: [
    f => f.endsWith('-Setup.exe'),   // NSIS installer (excludes .blockmap)
    f => f === 'win-unpacked',       // unpacked app dir
  ],
  mac: [
    f => f.endsWith('.dmg') && !f.endsWith('.blockmap'),
    f => f === 'mac' || f === 'mac-arm64',  // unpacked .app dir
  ],
  linux: [
    f => f.endsWith('.AppImage'),
    f => f === 'linux-unpacked',
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Collect all files under `rootDir` matching the given patterns.
 * Returns an array of { absPath, relPath } objects.
 */
function collectEntries(rootDir, patterns) {
  const entries = fs.readdirSync(rootDir)
  const matched = entries.filter(name => patterns.some(p => p(name)))

  /** @type {{ absPath: string, relPath: string }[]} */
  const result = []

  for (const name of matched) {
    const abs = path.join(rootDir, name)
    walkEntry(abs, name, result)
  }
  return result
}

function walkEntry(absPath, relPath, acc) {
  const stat = fs.statSync(absPath)
  if (stat.isDirectory()) {
    acc.push({ absPath, relPath, stat, isDir: true })
    for (const child of fs.readdirSync(absPath)) {
      walkEntry(path.join(absPath, child), `${relPath}/${child}`, acc)
    }
  } else {
    acc.push({ absPath, relPath, stat, isDir: false })
  }
}

// ── POSIX ustar tar writer ────────────────────────────────────────────────────

const BLOCK = 512

function encodeOctal(value, length) {
  return value.toString(8).padStart(length - 1, '0') + '\0'
}

function encodeStr(str, length) {
  const buf = Buffer.alloc(length, 0)
  buf.write(str.slice(0, length), 'utf8')
  return buf
}

function buildHeader(entry) {
  const header = Buffer.alloc(BLOCK, 0)
  const { relPath, stat, isDir } = entry

  const name  = isDir ? `${relPath}/` : relPath
  const mode  = isDir ? 0o755 : 0o644
  const size  = isDir ? 0 : stat.size
  const mtime = Math.floor(stat.mtimeMs / 1000)
  const type  = isDir ? '5' : '0'

  // name (100 bytes)
  encodeStr(name, 100).copy(header, 0)
  // mode (8 bytes)
  Buffer.from(encodeOctal(mode, 8)).copy(header, 100)
  // uid / gid (8 bytes each)
  Buffer.from(encodeOctal(0, 8)).copy(header, 108)
  Buffer.from(encodeOctal(0, 8)).copy(header, 116)
  // size (12 bytes)
  Buffer.from(encodeOctal(size, 12)).copy(header, 124)
  // mtime (12 bytes)
  Buffer.from(encodeOctal(mtime, 12)).copy(header, 136)
  // checksum placeholder (8 spaces)
  Buffer.from('        ').copy(header, 148)
  // typeflag (1 byte)
  header[156] = type.charCodeAt(0)
  // magic "ustar" (6 bytes) + version "00" (2 bytes)
  Buffer.from('ustar\0').copy(header, 257)
  Buffer.from('00').copy(header, 263)

  // Compute checksum
  let checksum = 0
  for (const byte of header) checksum += byte
  Buffer.from(encodeOctal(checksum, 7) + '\0').copy(header, 148)

  return header
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(RELEASE_DIR)) {
  console.error(`Error: ${RELEASE_DIR} not found. Run 'make build-${PLATFORM}' first.`)
  process.exit(1)
}

console.log(`Collecting ${PLATFORM} artifacts from ${RELEASE_DIR} …`)
const entries = collectEntries(RELEASE_DIR, PLATFORM_PATTERNS[PLATFORM])

if (entries.length === 0) {
  console.error(`No matching artifacts found for platform "${PLATFORM}" in ${RELEASE_DIR}.`)
  process.exit(1)
}

console.log(`Found ${entries.length} entries. Writing → ${OUT_FILE}`)

const outStream  = fs.createWriteStream(OUT_FILE)
const gzip       = zlib.createGzip({ level: 6 })
gzip.pipe(outStream)

for (const entry of entries) {
  gzip.write(buildHeader(entry))

  if (!entry.isDir) {
    const data = fs.readFileSync(entry.absPath)
    gzip.write(data)

    // Pad to next 512-byte block boundary
    const remainder = BLOCK - (data.length % BLOCK)
    if (remainder < BLOCK) {
      gzip.write(Buffer.alloc(remainder, 0))
    }
  }
}

// End-of-archive: two zero blocks
gzip.write(Buffer.alloc(BLOCK * 2, 0))
gzip.end()

outStream.on('finish', () => {
  const sizeMb = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1)
  console.log(`Done: ${OUT_FILE} (${sizeMb} MB)`)
})

outStream.on('error', err => {
  console.error('Write error:', err)
  process.exit(1)
})
