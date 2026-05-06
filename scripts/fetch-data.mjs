// =============================================================================
//  Build-time SharePoint fetch
// -----------------------------------------------------------------------------
//  Runs as part of `npm run build` (Vercel runs this on every deployment).
//  Downloads the configured SharePoint .xlsx and writes it to public/data.xlsx
//  so Vite ships it as a static asset under https://<your-site>/data.xlsx.
//
//  Tries multiple strategies in order, mirroring the dev-time Vite plugin in
//  vite.config.js. If all strategies fail, the script exits non-zero and the
//  Vercel build fails — Vercel will keep the previous successful deployment
//  live, so a SharePoint hiccup never replaces good data with broken data.
//
//  Run locally: `node scripts/fetch-data.mjs`
// =============================================================================

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public', 'data.xlsx')

// Accept the share URL from an env var so it can be rotated without a code
// change. Falls back to the value Paul gave us so local builds don't require
// configuration.
const SHARE_URL =
  process.env.SHAREPOINT_SHARE_URL ||
  'https://usoncologynet-my.sharepoint.com/:x:/g/personal/paul_rogerson_usoncology_com/IQC1baXqs3TIRYFFri6jbUngAWXIqINT8hm4vGMNNDBIDW8'

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

function buildStrategies(shareUrl) {
  const u = new URL(shareUrl)
  const tenantHost = u.host
  const m = u.pathname.match(/^\/:[a-z]+:\/g\/personal\/([^/]+)\/([^/?]+)/i)
  const userSlug = m?.[1]
  const shareToken = m?.[2]

  // Microsoft Graph anonymous-shares endpoint.
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

async function main() {
  console.log(`[fetch-data] Source URL: ${SHARE_URL}`)
  console.log(`[fetch-data] Output:     ${OUTPUT_PATH}`)

  const strategies = buildStrategies(SHARE_URL)
  const errors = []

  for (const { name, url } of strategies) {
    try {
      console.log(`[fetch-data] trying "${name}" → ${url.slice(0, 100)}…`)
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': BROWSER_UA, Accept: '*/*' },
      })
      const ct = (response.headers.get('Content-Type') || '').toLowerCase()
      if (!response.ok) {
        errors.push(`${name}: HTTP ${response.status}`)
        console.log(`[fetch-data]   ✗ HTTP ${response.status} (${ct})`)
        continue
      }
      if (ct.includes('text/html')) {
        errors.push(`${name}: returned HTML (${ct})`)
        console.log(`[fetch-data]   ✗ returned HTML viewer page, not file bytes`)
        continue
      }
      const buf = Buffer.from(await response.arrayBuffer())
      if (buf.length < 1024) {
        errors.push(`${name}: body too small (${buf.length} bytes)`)
        console.log(`[fetch-data]   ✗ body too small (${buf.length} bytes)`)
        continue
      }

      // Success — write to disk.
      await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
      await fs.writeFile(OUTPUT_PATH, buf)
      const sizeMB = (buf.length / (1024 * 1024)).toFixed(2)
      console.log(`[fetch-data] ✓ wrote ${sizeMB} MB via "${name}"`)
      return
    } catch (err) {
      errors.push(`${name}: ${err.message}`)
      console.log(`[fetch-data]   ✗ ${err.message}`)
    }
  }

  console.error('\n[fetch-data] All strategies failed:')
  for (const e of errors) console.error(`  • ${e}`)
  console.error(
    '\nHints: confirm the SharePoint link is "Anyone with the link" in OneDrive sharing,\n' +
      'and that the SHAREPOINT_SHARE_URL env var (if set) points to a current share.',
  )
  process.exit(1)
}

main().catch((err) => {
  console.error('[fetch-data] unexpected error:', err)
  process.exit(2)
})
