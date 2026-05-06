const RIBBON_COLOR_BY_KEYWORD = [
  ['breast cancer (er+)',           ['#f9a8d4', '#ec4899']],
  ['breast cancer (her2+)',         ['#fbcfe8', '#db2777']],
  ['breast cancer (triple negative)', ['#fda4af', '#e11d48']],
  ['breast',                        ['#f472b6', '#ec4899']],
  ['anal cancer',                   ['#a78bfa', '#22c55e']],
  ['bile duct',                     ['#34d399', '#10b981']],
  ['gallbladder',                   ['#22d3ee', '#0ea5e9']],
  ['cholangio',                     ['#34d399', '#10b981']],
  ['colorectal',                    ['#3b82f6', '#1d4ed8']],
  ['colon',                         ['#3b82f6', '#1d4ed8']],
  ['rectal',                        ['#3b82f6', '#1d4ed8']],
  ['gastric',                       ['#60a5fa', '#3b82f6']],
  ['stomach',                       ['#86efac', '#22c55e']],
  ['pancrea',                       ['#c084fc', '#9333ea']],
  ['liver',                         ['#10b981', '#047857']],
  ['hepato',                        ['#10b981', '#047857']],
  ['bladder',                       ['#fbbf24', '#a855f7']],
  ['urothelial',                    ['#fbbf24', '#a855f7']],
  ['kidney',                        ['#f97316', '#ea580c']],
  ['renal',                         ['#f97316', '#ea580c']],
  ['prostate',                      ['#67e8f9', '#22d3ee']],
  ['testicular',                    ['#9ca3af', '#6b7280']],
  ['cervical',                      ['#5eead4', '#14b8a6']],
  ['ovarian',                       ['#7dd3fc', '#0ea5e9']],
  ['uterine',                       ['#a3e635', '#65a30d']],
  ['endometrial',                   ['#a3e635', '#65a30d']],
  ['lung',                          ['#fafafa', '#d4d4d8']],
  ['mesothelioma',                  ['#fafafa', '#d4d4d8']],
  ['head and neck',                 ['#a3e635', '#65a30d']],
  ['oral',                          ['#fdba74', '#fb923c']],
  ['thyroid',                       ['#fde68a', '#a78bfa']],
  ['acute myeloid leukemia',        ['#fb923c', '#ea580c']],
  ['leukemia',                      ['#fb923c', '#ea580c']],
  ['chronic myeloid leukemia',      ['#fb923c', '#c2410c']],
  ['lymphoma',                      ['#bef264', '#65a30d']],
  ['hodgkin',                       ['#a3e635', '#65a30d']],
  ['myeloma',                       ['#a78bfa', '#7c3aed']],
  ['brain',                         ['#9ca3af', '#6b7280']],
  ['glio',                          ['#9ca3af', '#6b7280']],
  ['sarcoma',                       ['#fde68a', '#facc15']],
  ['bone',                          ['#fde68a', '#facc15']],
  ['melanoma',                      ['#1f2937', '#0a0a0a']],
  ['skin',                          ['#1f2937', '#0a0a0a']],
  ['merkel',                        ['#a78bfa', '#7c3aed']],
  ['neuroendocrine',                ['#fb7185', '#e11d48']],
  ['carcinoid',                     ['#fb7185', '#e11d48']],
  ['adrenal',                       ['#a78bfa', '#7c3aed']],
  ['mds',                           ['#67e8f9', '#06b6d4']],
  ['mpn',                           ['#67e8f9', '#06b6d4']],
]

const FALLBACK = ['#94a3b8', '#475569']

// Override the default ribbon for a disease with a real image URL:
//   OVERRIDES.set('Breast Cancer (ER+)', '/images/breast-er.jpg')
export const OVERRIDES = new Map()

export function getRibbonStyle(diseaseName) {
  if (OVERRIDES.has(diseaseName)) {
    return { kind: 'image', src: OVERRIDES.get(diseaseName) }
  }
  const lower = (diseaseName || '').toLowerCase()
  for (const [kw, palette] of RIBBON_COLOR_BY_KEYWORD) {
    if (lower.includes(kw)) {
      return { kind: 'ribbon', colors: palette }
    }
  }
  return { kind: 'ribbon', colors: FALLBACK }
}
