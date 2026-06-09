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

const BASE = 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/OJm6mMdE64G0gAwbwHJu/pub/'

export const OVERRIDES = new Map([
  ['Anal Cancer',                        BASE + 'c22auIjpaiTi0jcIlqXj.png'],
  ['Bile Duct Cancer',                   BASE + '4gjv5FnKOy2wqBPI11kD.webp'],
  ['Bladder (Urothelial) Cancer',        BASE + 'raRcit2IFCNd946inBhZ.jpg'],
  ['Breast Cancer (Triple Negative)',    BASE + '5I9p1vDoDTxT0JTvtsuA.png'],
  ['Breast Cancer (ER+)',                BASE + 'OizG1r2TLU7H8SI4f5Ed.webp'],
  ['Breast Cancer (HER2+)',              BASE + 'QMQKE7g2LlDX6lrVpTVT.jpg'],
  ['Cervical Cancer',                    BASE + 'zNNqiRtRKr9nPF40g72E.png'],
  ['Chronic Myeloid Leukemia',           BASE + 'TTnc0d4n0Oo2uDTKRXQ7.webp'],
  ['Chronic Lymphocytic Leukemia',       BASE + 'kP1DcLJzVl6Efa3ReG1E.jpg'],
  ['Colorectal Cancer',                  BASE + 'iI9Loaqs2t6i9uEBJJky.png'],
  ['Endometrial (Uterine) Cancer',       BASE + 'q1miQUviJISmjUYILkXx.webp'],
  ['Gastric & Esophageal Cancer',        BASE + 'odDHx3JQYPS9GJFixzKN.jpg'],
  ['Gliomas',                            BASE + 'S2jmBgDReVS2pEdqZWHE.webp'],
  ['Head & Neck Cancer',                 BASE + 'BlGM7e584yDZEhIDSEmB.webp'],
  ['Hematology',                         BASE + '1zvEThIKHMFo3PLC2sHI.jpg'],
  ['Hepatocellular Carcinoma',           BASE + 'bTweEh4quNa0GJT0tzDv.jpg'],
  ['Hodgkin Lymphoma',                   BASE + 'Yq9owzWzLjFmTbUu4s4F.webp'],
  ['Melanoma',                           BASE + 'Q29p1gEiZ1PMCAOMU5Q1.jpg'],
  ['Multiple Myeloma',                   BASE + 'XAe6Bo7HVqawD2BkBUAR.jpg'],
  ['Myelodysplastic Syndrome',           BASE + '4tMBsfgEDN0JmC14YZIK.jpg'],
  ['Myelofibrosis',                      BASE + 'mAfDnLi3IcQFa0Nhhr4L.webp'],
  ['Neuroendocrine Carcinoma',           BASE + 'BiEe1bmrr8xAVrQA4jfS.jpg'],
  ["Non-Hodgkin's Lymphoma (B-Cell)",    BASE + 'UFcNfkddZFOsZJVFwxk0.jpg'],
  ["Non-Hodgkin's Lymphoma (T-Cell)",    BASE + 'EVf7p9w8noAjlvkqVNX8.avif'],
  ['Non-Small Cell Lung Cancer',         BASE + 'Z3ZINcnNOABOc3tST0HK.jpg'],
  ['Ovarian Cancer',                     BASE + 'zL18nocTPgGkss8VgEY5.webp'],
  ['Pancreatic Cancer',                  BASE + '32pe0IwIdXsJQMi1DB3E.png'],
  ['Prostate Cancer',                    BASE + '4hkYlTTLSll0Zb7lqgxD.jpg'],
  ['Phase I',                            BASE + 'RAJSqSNwrLfUOzKN8Yb9.jpg'],
  ['Renal Cell Carcinoma',               BASE + '559MnMs2DYpYGKzaoX8v.jpg'],
  ['Small Cell Lung Cancer',             BASE + 'rqsetGDCGjgjUFDA68xn.avif'],
  ['Solid Tumor Trials',                 BASE + 'U2VOhmVeSU7YoHOeBfi6.jpg'],
  ['Skin Cancer (Non-Melanoma)',         BASE + 'DuFGnp5PFPCKZJyDjsh7.jpg'],
])

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
