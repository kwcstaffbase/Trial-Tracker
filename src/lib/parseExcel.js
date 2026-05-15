import * as XLSX from 'xlsx'

const REGION_HEADERS = new Set([
  'Central South Texas',
  'DFW',
  'Gulf Coast',
  'Northeast Texas',
  'San Antonio',
  'West Texas',
])

function isMasterRow(row) {
  const joined = Object.values(row).join(' ').toUpperCase()
  return joined.includes('MASTER ROW') || joined.includes('DO NOT DELETE')
}

// -----------------------------------------------------------------------------
// Step 1 — Heavy XLSX parsing
// Reads bytes, returns the rows array and metadata. This is the expensive
// step (~1-3 sec for 50k rows). Output is JSON-serializable and IndexedDB-
// safe so we can cache it directly.
// -----------------------------------------------------------------------------
export async function parseRawWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const wsName = wb.SheetNames[0]
  const ws = wb.Sheets[wsName]

  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false })
  if (!aoa.length) throw new Error('Spreadsheet appears to be empty.')

  const headers = aoa[0].map((h) => (h == null ? '' : String(h).trim()))
  const rawRows = aoa.slice(1)

  const rows = []
  rawRows.forEach((arr, i) => {
    const obj = { __idx: i }
    headers.forEach((h, j) => {
      obj[h] = arr[j] ?? null
    })
    if (!isMasterRow(obj)) rows.push(obj)
  })
  rows.forEach((r, i) => (r.__idx = i))

  const linkIdx = headers.indexOf('NCT Trial Link')
  const clinicHeaders = []
  if (linkIdx >= 0) {
    for (let i = linkIdx + 1; i < headers.length; i++) {
      const h = headers[i]
      if (h && !REGION_HEADERS.has(h)) clinicHeaders.push(h)
    }
  }

  return { headers, rows, clinicHeaders }
}

// -----------------------------------------------------------------------------
// Step 2 — Cheap index building
// Takes the raw rows (from parseRawWorkbook OR from IndexedDB cache) and
// builds the Map/Set indexes the pages query against. Runs in ~50–100ms.
// Maps/Sets aren't cached (not trivially structuredClone-able from old DBs),
// so we always rebuild them on app start.
// -----------------------------------------------------------------------------
export function buildIndexes({ headers, rows, clinicHeaders }) {
  const diseasesSet = new Set()
  const linesByDisease = new Map()
  const trialsByDiseaseLot = new Map()
  const regionsByRow = []

  rows.forEach((r) => {
    const disease = r['Disease Type'] || 'Unspecified'
    const lot = r['Line of Therapy'] || 'Unspecified'
    const region = r['Region'] || 'Unspecified Region'
    diseasesSet.add(disease)
    if (!linesByDisease.has(disease)) linesByDisease.set(disease, new Set())
    linesByDisease.get(disease).add(lot)
    const key = `${disease}::${lot}`
    if (!trialsByDiseaseLot.has(key)) trialsByDiseaseLot.set(key, [])
    trialsByDiseaseLot.get(key).push(r.__idx)
    regionsByRow.push(region)
  })

  const diseases = [...diseasesSet].sort()
  const linesByDiseaseArr = new Map()
  for (const [d, set] of linesByDisease) {
    linesByDiseaseArr.set(d, [...set].sort(lineOfTherapyOrder))
  }

  return {
    headers,
    rows,
    diseases,
    linesByDisease: linesByDiseaseArr,
    trialsByDiseaseLot,
    regionsByRow,
    clinicHeaders,
  }
}

// Convenience wrapper for the original API: parse + build in one step.
export async function parseTrialWorkbook(file) {
  const raw = await parseRawWorkbook(file)
  return buildIndexes(raw)
}

const LOT_ORDER = [
  'Neoadjuvant',
  'Adjuvant',
  'Localized',
  'Locally Advanced',
  'Metastatic First Line',
  'Metastatic Second & Subsequent Lines',
  'First Line',
  'Second & Subsequent Lines',
  'Maintenance',
]
function lineOfTherapyOrder(a, b) {
  const ai = LOT_ORDER.indexOf(a)
  const bi = LOT_ORDER.indexOf(b)
  if (ai === -1 && bi === -1) return a.localeCompare(b)
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

export function getClinicsForRow(row, clinicHeaders) {
  const out = []
  for (const h of clinicHeaders) {
    const v = row[h]
    if (typeof v === 'string' && v.includes('@')) {
      out.push({ clinic: h, email: v.trim() })
    }
  }
  return out
}
