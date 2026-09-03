import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images are allowed.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image is too large — max size is 5MB.' }, { status: 400 })
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())

  // ── Preferred path: Cloudflare R2 (persistent across redeploys) ──
  if (isR2Configured()) {
    try {
      const url = await uploadToR2(`uploads/${filename}`, bytes, file.type)
      return NextResponse.json({ data: { url, storage: 'r2' } }, { status: 201 })
    } catch (err) {
      console.error('[upload] R2 upload failed, falling back to local disk:', err)
      // fall through to local disk below rather than failing the whole request
    }
  }

  // ── Fallback: local disk (works out of the box, but see the persistence
  //    warning in DEPLOYMENT-HOSTINGER-BUSINESS.md — set up R2 to avoid it) ──
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, filename), bytes)

  return NextResponse.json({ data: { url: `/uploads/${filename}`, storage: 'local' } }, { status: 201 })
}
