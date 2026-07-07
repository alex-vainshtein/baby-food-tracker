import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const SYNC_ID_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/

interface SyncPayload {
  state: Record<string, unknown>
  updatedAt: number
}

function isValidPayload(body: unknown): body is SyncPayload {
  if (!body || typeof body !== 'object') return false
  const payload = body as SyncPayload
  return typeof payload.state === 'object' && typeof payload.updatedAt === 'number'
}

export default async (req: Request, context: Context) => {
  const syncId = context.params?.syncId

  if (!syncId || !SYNC_ID_PATTERN.test(syncId)) {
    return Response.json({ error: 'Invalid sync code' }, { status: 400 })
  }

  const store = getStore('baby-food-tracker-sync')

  if (req.method === 'GET') {
    const data = (await store.get(syncId, { type: 'json' })) as SyncPayload | null
    return Response.json(data ?? { state: {}, updatedAt: 0 })
  }

  if (req.method === 'PUT') {
    const body = await req.json()
    if (!isValidPayload(body)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await store.setJSON(syncId, body)
    return Response.json({ ok: true, updatedAt: body.updatedAt })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

export const config: Config = {
  path: '/api/sync/:syncId',
}
