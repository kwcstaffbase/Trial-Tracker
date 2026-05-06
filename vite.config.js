import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sharable from an env var (Vercel / .env.local). Falls back to the URL
// Paul gave us so a fresh clone Just Works without configuration.
const SHARE_URL =
  process.env.SHAREPOINT_SHARE_URL ||
  'https://usoncologynet-my.sharepoint.com/:x:/g/personal/paul_rogerson_usoncology_com/IQC1baXqs3TIRYFFri6jbUngAWXIqINT8hm4vGMNNDBIDW8'

// ---------------------------------------------------------------------------
// Dev-only middleware. Serves /sharepoint-data with the file bytes by
// trying multiple SharePoint download strategies server-side. This keeps
// `npm run dev` working without re-downloading the file on every refresh.
//
// In production this plugin doesn't run — the file is bundled at build time
// by scripts/fetch-data.mjs and served as /data.xlsx instead.
// ---------------------------------------------------------------------------
function sharepointDataPlugin() {
  return {
    name: 'sharepoint-data',
    apply: 'serve', // dev only
    configureServer(server) {
      server.middlewares.use('/sharepoint-data', async (req, res) => {
        const strategies = buildStrategies(SHARE_URL)
        const errors = []

        for (const { name, url } of strategies) {
          try {
            const response = await fetch(url, {
              redirect: 'follow',
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                Accept: '*/*',
              },
            })
            const ct = (response.headers.get('Content-Type') || '').toLowerCase()
            if (!response.ok) {
              errors.push({ strategy: name, status: response.status, contentType: ct })
              continue
            }
            if (ct.includes('text/html')) {
              errors.push({ strategy: name, status: response.status, contentType: ct, note: 'returned HTML' })
              continue
            }
            const buf = Buffer.from(await response.arrayBuffer())
            if (buf.length < 1024) {
              errors.push({ strategy: name, status: response.status, note: `body too small (${buf.length}B)` })
              continue
            }
            res.statusCode = 200
            res.setHeader('Content-Type', ct || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('X-Strategy-Used', name)
            res.end(buf)
            console.log(`[sharepoint-data] served ${buf.length} bytes via "${name}"`)
            return
          } catch (err) {
            errors.push({ strategy: name, error: err.message })
          }
        }
        console.error('[sharepoint-data] all strategies failed:', errors)
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'All download strategies failed', attempts: errors }, null, 2))
      })
    },
  }
}

function buildStrategies(shareUrl) {
  const u = new URL(shareUrl)
  const tenantHost = u.host
  const m = u.pathname.match(/^\/:[a-z]+:\/g\/personal\/([^/]+)\/([^/?]+)/i)
  const userSlug = m?.[1]
  const shareToken = m?.[2]

  const b64 = Buffer.from(shareUrl).toString('base64')
  const shareId = 'u!' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const list = [
    {
      name: 'graph-shares-content',
      url: `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`,
    },
  ]
  if (userSlug && shareToken) {
    list.push({
      name: 'sharepoint-download-aspx',
      url: `https://${tenantHost}/personal/${userSlug}/_layouts/15/download.aspx?share=${shareToken}`,
    })
  }
  list.push({
    name: 'sharepoint-download-1',
    url: `${shareUrl}?download=1`,
  })
  return list
}

export default defineConfig({
  plugins: [react(), sharepointDataPlugin()],
  server: {
    port: 5173,
    open: true,
  },
})
