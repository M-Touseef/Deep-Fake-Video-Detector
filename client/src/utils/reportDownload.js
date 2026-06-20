const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 46

// ─── Text helpers ────────────────────────────────────────────────────────────

function cleanText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
}

function escapePdfText(value) {
  return cleanText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function safeFilePart(value) {
  return cleanText(value).replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'analysis'
}

function text(commands, value, x, y, size = 10, font = 'F1', color = '0.88 0.95 0.98') {
  commands.push(`${color} rg`)
  commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`)
}

function rect(commands, x, y, width, height, fill, stroke = null) {
  commands.push(`${fill} rg`)
  commands.push(`${x} ${y} ${width} ${height} re f`)
  if (stroke) {
    commands.push(`${stroke} RG`)
    commands.push(`${x} ${y} ${width} ${height} re S`)
  }
}

function line(commands, x1, y1, x2, y2, color = '0.20 0.83 0.92', width = 1) {
  commands.push(`${color} RG`)
  commands.push(`${width} w`)
  commands.push(`${x1} ${y1} m ${x2} ${y2} l S`)
}

function wrappedText(commands, value, x, y, size = 10, maxChars = 82, font = 'F1', color = '0.70 0.80 0.84', leading = 14) {
  const words = cleanText(value).split(/\s+/).filter(Boolean)
  let current = ''
  let nextY = y

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      text(commands, current, x, nextY, size, font, color)
      current = word
      nextY -= leading
    } else {
      current = candidate
    }
  })

  if (current) {
    text(commands, current, x, nextY, size, font, color)
    nextY -= leading
  }

  return nextY
}

function sectionTitle(commands, title, y) {
  text(commands, title, MARGIN, y, 13, 'F2', '0.90 0.99 1')
  line(commands, MARGIN, y - 8, PAGE_WIDTH - MARGIN, y - 8, '0.13 0.83 0.93', 0.8)
  return y - 28
}

function pill(commands, label, x, y, width, fill = '0.06 0.18 0.22', color = '0.70 0.95 1') {
  rect(commands, x, y - 5, width, 20, fill, '0.13 0.55 0.62')
  text(commands, label, x + 10, y, 8, 'F2', color)
}

function progressBar(commands, x, y, width, score, color = '0.93 0.27 0.27') {
  const filled = Math.max(0, Math.min(score, 100)) / 100 * width
  rect(commands, x, y, width, 8, '0.13 0.19 0.23')
  rect(commands, x, y, filled, 8, color)
}

function pageShell(commands, title, subtitle, pageNumber) {
  rect(commands, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, '0.02 0.04 0.05')
  rect(commands, 0, PAGE_HEIGHT - 92, PAGE_WIDTH, 92, '0.03 0.11 0.14')
  rect(commands, 0, PAGE_HEIGHT - 94, PAGE_WIDTH, 2, '0.13 0.83 0.93')
  rect(commands, MARGIN, PAGE_HEIGHT - 72, 36, 36, '0.05 0.20 0.24', '0.20 0.83 0.92')
  text(commands, 'VAI', MARGIN + 8, PAGE_HEIGHT - 58, 10, 'F2', '0.78 0.98 1')
  text(commands, title, MARGIN + 48, PAGE_HEIGHT - 48, 18, 'F2', '0.95 0.99 1')
  text(commands, subtitle, MARGIN + 48, PAGE_HEIGHT - 66, 9, 'F1', '0.58 0.72 0.78')
  text(commands, `Page ${pageNumber}`, PAGE_WIDTH - MARGIN - 34, 26, 8, 'F2', '0.38 0.54 0.60')
}

// ─── Image helpers ────────────────────────────────────────────────────────────

/**
 * Strip the data URI prefix and return raw base64 bytes.
 * Returns null if the input is empty / invalid.
 */
function stripDataUri(dataUri) {
  if (!dataUri) return null
  const comma = dataUri.indexOf(',')
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri
  if (!b64 || b64.length < 16) return null
  return b64
}

/**
 * Decode a base64 string to a Uint8Array.
 */
function b64ToBytes(b64) {
  try {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

/**
 * Read JPEG dimensions from raw bytes (SOF0/SOF2 markers).
 * Falls back to 224×224 if parsing fails.
 */
function jpegDimensions(bytes) {
  try {
    let i = 2 // skip SOI 0xFFD8
    while (i < bytes.length - 8) {
      if (bytes[i] !== 0xFF) break
      const marker = bytes[i + 1]
      const length = (bytes[i + 2] << 8) | bytes[i + 3]
      if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8) {
        const h = (bytes[i + 5] << 8) | bytes[i + 6]
        const w = (bytes[i + 7] << 8) | bytes[i + 8]
        if (w > 0 && h > 0) return { w, h }
      }
      i += 2 + length
    }
  } catch { /* ignore */ }
  return { w: 224, h: 224 }
}

// ─── PDF builder ──────────────────────────────────────────────────────────────

class PdfBuilder {
  constructor() {
    this.pages = []       // [{commands: string[], imageXObjects: [{id,name}]}]
    this.imageObjects = []  // {id, bytes} — raw JPEG byte arrays
    this._nextId = 5        // reserve 1=catalog 2=pages 3=fontR 4=fontB
  }

  _allocId() {
    return this._nextId++
  }

  /**
   * Register a JPEG image and return an XObject name (e.g. "Im0").
   * Returns null if the base64 is invalid.
   */
  addImage(b64) {
    const raw = stripDataUri(b64)
    if (!raw) return null
    const bytes = b64ToBytes(raw)
    if (!bytes) return null
    const id = this._allocId()
    const name = `Im${this.imageObjects.length}`
    this.imageObjects.push({ id, name, bytes })
    return { id, name }
  }

  addPage(commands, imageRefs = []) {
    // imageRefs: [{name, id}]  — XObjects used on this page
    this.pages.push({ commands: commands.join('\n'), imageRefs })
  }

  build() {
    const objects = []
    const pageObjectIds = []

    const fontRegularId = 3
    const fontBoldId = 4

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
    objects[fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    objects[fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

    // Write image XObjects
    for (const img of this.imageObjects) {
      const { w, h } = jpegDimensions(img.bytes)
      const header = `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`
      const footer = '\nendstream'
      objects[img.id] = { _raw: true, header, bytes: img.bytes, footer }
    }

    // Write page content + page objects
    for (const page of this.pages) {
      const contentId = this._allocId()
      const pageId = this._allocId()

      // Build XObject resource dict for this page
      const xobjEntries = page.imageRefs.map(r => `/${r.name} ${r.id} 0 R`).join(' ')
      const xobjDict = xobjEntries ? ` /XObject << ${xobjEntries} >>` : ''

      objects[contentId] = `<< /Length ${page.commands.length} >>\nstream\n${page.commands}\nendstream`
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >>${xobjDict} >> /Contents ${contentId} 0 R >>`
      pageObjectIds.push(pageId)
    }

    objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

    // Serialize — binary-safe for image streams
    const parts = ['%PDF-1.4\n']
    const offsets = new Array(objects.length).fill(0)

    for (let index = 1; index < objects.length; index++) {
      const obj = objects[index]
      offsets[index] = parts.reduce((s, p) => s + (typeof p === 'string' ? p.length : p.byteLength), 0)
      if (obj && obj._raw) {
        parts.push(`${index} 0 obj\n${obj.header}`)
        parts.push(obj.bytes)
        parts.push(`${obj.footer}\nendobj\n`)
      } else {
        parts.push(`${index} 0 obj\n${obj}\nendobj\n`)
      }
    }

    // xref — offsets only valid for text parts; use a linearized approach
    // For simplicity (no binary image offsets needed for viewing), write a cross-ref
    const xrefParts = []
    const totalLen = parts.reduce((s, p) => s + (typeof p === 'string' ? p.length : p.byteLength), 0)
    const xrefOffset = totalLen
    xrefParts.push(`xref\n0 ${objects.length}\n0000000000 65535 f \n`)
    // We don't track exact byte offsets for binary objects — use linearized xref
    let bytePos = parts[0].length  // '%PDF-1.4\n'
    for (let index = 1; index < objects.length; index++) {
      xrefParts.push(`${String(Math.round(bytePos)).padStart(10, '0')} 00000 n \n`)
      const obj = objects[index]
      if (obj && obj._raw) {
        bytePos += (`${index} 0 obj\n${obj.header}`).length + obj.bytes.byteLength + (`${obj.footer}\nendobj\n`).length
      } else {
        bytePos += (`${index} 0 obj\n${obj}\nendobj\n`).length
      }
    }
    xrefParts.push(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

    // Build final blob from parts + xref
    const allParts = [...parts, xrefParts.join('')]
    return new Blob(allParts, { type: 'application/pdf' })
  }
}

// ─── Draw a real JPEG image in PDF command stream ─────────────────────────────

/**
 * Emit PDF commands to paint an image XObject at (x, y) with given w/h.
 * Uses q/Q to save/restore the graphics state.
 */
function drawImage(commands, name, x, y, w, h) {
  commands.push(`q ${w} 0 0 ${h} ${x} ${y} cm /${name} Do Q`)
}

// ─── Report model ─────────────────────────────────────────────────────────────

function makeReportModel(result) {
  const fakeProbability = Number(result.fakeProbability ?? 0)
  const authenticityScore = Number(result.authenticityScore ?? Math.max(0, 100 - fakeProbability))
  const isFake = result.finalPrediction === 'Fake'

  // Use real segments from the result if available
  const rawSegments = result.manipulatedSegments || []
  const segments = rawSegments.length > 0
    ? rawSegments.map(seg => ({
        label: seg.label || seg.timeRange || 'Segment',
        timeRange: seg.timeRange || '',
        verdict: seg.verdict || 'LOW',
        score: typeof seg.score === 'number' ? Math.round(seg.score) : 0,
      }))
    : []

  const affectedRegions = Array.isArray(result.affectedRegions) && result.affectedRegions.length > 0
    ? result.affectedRegions
    : ['facial region']

  return {
    ...result,
    fakeProbability,
    authenticityScore,
    affectedRegions,
    segments,
    suspiciousFrames: Array.isArray(result.suspiciousFrames) ? result.suspiciousFrames : [],
    verdictLabel: isFake ? 'Likely Manipulated' : 'Likely Authentic',
    recommendedAction: isFake ? 'Do not share as verified' : 'Likely safe with source check',
    generatedAt: new Date().toLocaleString(),
    warnings: [
      'Prediction should be reviewed with source context before publication.',
      'Heatmaps explain model attention, not absolute proof of intent.',
      'Low-resolution or compressed videos can reduce face-detail reliability.',
    ],
    trustChecklist: [
      'Check whether the source account or publisher is credible.',
      'Compare the video against another trusted copy when possible.',
      'Review suspicious frames and Grad-CAM heatmaps before sharing.',
      'Use the PDF as forensic support, not as the only evidence.',
    ],
  }
}

// ─── Frame evidence row ───────────────────────────────────────────────────────

function addFrameEvidenceRow(page2Commands, imageRefs, pdf, frame, rowY) {
  // Text column (left)
  text(page2Commands, frame.frameNumber, MARGIN, rowY, 12, 'F2', '0.95 0.99 1')
  text(page2Commands, `Suspicion: ${frame.fakeProbability}%`, MARGIN, rowY - 18, 10, 'F1', '0.95 0.70 0.70')
  text(page2Commands, `Status: ${frame.status}`, MARGIN, rowY - 34, 10, 'F1', '0.75 0.90 0.94')
  const regions = Array.isArray(frame.affectedRegions) ? frame.affectedRegions.join(', ') : ''
  wrappedText(page2Commands, `Region: ${regions}`, MARGIN, rowY - 52, 8, 38, 'F1', '0.60 0.73 0.78', 11)

  // Image column (right) — actual JPEG XObjects or placeholder boxes
  const imgW = 120
  const imgH = 110
  const originalX = MARGIN + 170
  const heatmapX = originalX + imgW + 16
  const imgY = rowY - imgH

  // Labels above images
  text(page2Commands, 'Original', originalX, rowY + 2, 8, 'F2', '0.68 0.80 0.85')
  text(page2Commands, 'Grad-CAM', heatmapX, rowY + 2, 8, 'F2', '0.68 0.95 1')

  // Original image
  const origRef = pdf.addImage(frame.originalImage)
  if (origRef) {
    imageRefs.push(origRef)
    rect(page2Commands, originalX, imgY, imgW, imgH, '0.05 0.08 0.09')
    drawImage(page2Commands, origRef.name, originalX, imgY, imgW, imgH)
  } else {
    rect(page2Commands, originalX, imgY, imgW, imgH, '0.10 0.16 0.18', '0.22 0.33 0.38')
    text(page2Commands, 'No image', originalX + 32, imgY + 52, 8, 'F1', '0.40 0.50 0.55')
  }

  // Heatmap image
  const heatRef = pdf.addImage(frame.heatmapImage)
  if (heatRef) {
    imageRefs.push(heatRef)
    rect(page2Commands, heatmapX, imgY, imgW, imgH, '0.05 0.08 0.09')
    drawImage(page2Commands, heatRef.name, heatmapX, imgY, imgW, imgH)
  } else {
    rect(page2Commands, heatmapX, imgY, imgW, imgH, '0.13 0.07 0.07', '0.45 0.18 0.18')
    text(page2Commands, 'No heatmap', heatmapX + 26, imgY + 52, 8, 'F1', '0.40 0.50 0.55')
  }

  // Thin separator below row
  line(page2Commands, MARGIN, imgY - 8, PAGE_WIDTH - MARGIN, imgY - 8, '0.15 0.25 0.30', 0.4)
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function downloadPdfReport(result) {
  const report = makeReportModel(result)
  const pdf = new PdfBuilder()

  // ── Page 1: Summary ───────────────────────────────────────────────────────
  const page1 = []
  pageShell(page1, 'Deep Fake Detector Evidence Report', 'Deepfake detection, frame evidence, and Grad-CAM explainability', 1)

  let y = 666
  rect(page1, MARGIN, y - 92, PAGE_WIDTH - MARGIN * 2, 96, report.finalPrediction === 'Fake' ? '0.18 0.07 0.08' : '0.05 0.16 0.11', '0.32 0.18 0.20')
  pill(page1, `Verdict: ${report.verdictLabel}`, MARGIN + 18, y - 24, 150, report.finalPrediction === 'Fake' ? '0.35 0.10 0.12' : '0.08 0.25 0.18')
  text(page1, `Detection confidence: ${report.fakeProbability}%`, MARGIN + 18, y - 52, 16, 'F2', '0.98 0.92 0.92')
  text(page1, `Confidence calibration: ${report.confidenceLevel || '—'}`, MARGIN + 18, y - 76, 11, 'F1', '0.76 0.86 0.89')
  text(page1, report.recommendedAction, PAGE_WIDTH - MARGIN - 190, y - 47, 13, 'F2', '0.82 0.96 1')
  text(page1, 'Recommended action', PAGE_WIDTH - MARGIN - 190, y - 68, 9, 'F1', '0.55 0.68 0.73')

  y = sectionTitle(page1, 'Video Metadata', y - 124)
  const metadata = [
    `Filename: ${report.videoName || '—'}`,
    `Generated: ${report.generatedAt}`,
    `Analysed: ${report.analysisDate || '—'}`,
    `Frames analysed: ${report.framesAnalyzed || 0}`,
    `Faces detected: ${report.facesDetected || 0}`,
    `Model version: EfficientNet-B0 + Transformer Encoder`,
  ]
  metadata.forEach((item, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    text(page1, item, MARGIN + col * 260, y - row * 19, 10, 'F1', '0.72 0.83 0.88')
  })

  y -= 78
  y = sectionTitle(page1, 'Warnings', y)
  report.warnings.forEach((warning) => {
    y = wrappedText(page1, `- ${warning}`, MARGIN, y, 9, 95, 'F1', '0.78 0.84 0.86', 13) - 2
  })

  y = sectionTitle(page1, 'Plain-Language Guidance', y - 8)
  y = wrappedText(page1, `What this means: ${report.interpretation || '—'}`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3
  y = wrappedText(page1, `Suspicious regions: ${report.affectedRegions.join(', ')}.`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3
  y = wrappedText(page1, `What to do next: Open frame analysis, inspect heatmaps, and keep the PDF report with the case evidence.`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3

  y = sectionTitle(page1, 'Can I Trust This Video Checklist', y - 4)
  report.trustChecklist.forEach((item) => {
    y = wrappedText(page1, `- ${item}`, MARGIN, y, 9, 98, 'F1', '0.76 0.86 0.89', 12)
  })

  y = sectionTitle(page1, 'Human-Readable Conclusion', y - 8)
  wrappedText(page1, report.conclusion || '—', MARGIN, y, 9, 96, 'F1', '0.78 0.88 0.91', 13)

  pdf.addPage(page1, [])

  // ── Page 2: Segments + Frame Evidence ─────────────────────────────────────
  const page2Commands = []
  const page2ImageRefs = []
  pageShell(page2Commands, 'Evidence Timeline and Heatmaps', 'Segment-level risk and top suspicious frame evidence', 2)

  // Segment timeline
  y = sectionTitle(page2Commands, 'Segment Timeline', 666)
  if (report.segments.length === 0) {
    text(page2Commands, 'No segment data available for this analysis.', MARGIN, y, 9, 'F1', '0.55 0.65 0.70')
    y -= 20
  } else {
    report.segments.forEach((segment) => {
      const verdictLabel = segment.verdict ? segment.verdict.toUpperCase() : 'LOW'
      text(page2Commands, `${segment.label}  |  ${segment.timeRange}  |  ${verdictLabel}  |  ${segment.score}%`, MARGIN, y, 10, 'F2', '0.86 0.94 0.97')
      progressBar(page2Commands, MARGIN + 260, y - 1, 220, segment.score,
        verdictLabel === 'HIGH' ? '0.93 0.27 0.27' : verdictLabel === 'MEDIUM' ? '0.96 0.57 0.15' : '0.30 0.65 0.30')
      y -= 24
    })
  }

  // Frame evidence rows — up to 3 frames, each ~140px tall
  y = sectionTitle(page2Commands, 'Top Suspicious Frames and Grad-CAM Heatmaps', y - 18)
  const framesToShow = report.suspiciousFrames.slice(0, 3)

  if (framesToShow.length === 0) {
    text(page2Commands, 'No frame evidence was returned for this analysis.', MARGIN, y, 10, 'F1', '0.55 0.65 0.70')
  } else {
    framesToShow.forEach((frame, index) => {
      addFrameEvidenceRow(page2Commands, page2ImageRefs, pdf, frame, y - index * 148)
    })
  }

  const footerY = 74
  rect(page2Commands, MARGIN, footerY, PAGE_WIDTH - MARGIN * 2, 48, '0.04 0.13 0.16', '0.13 0.45 0.52')
  text(page2Commands, 'Report note', MARGIN + 16, footerY + 27, 10, 'F2', '0.88 0.98 1')
  wrappedText(page2Commands, 'This report supports forensic review. It should be interpreted with confidence scores, source context, and human verification.', MARGIN + 16, footerY + 13, 8, 95, 'F1', '0.62 0.75 0.80', 10)

  pdf.addPage(page2Commands, page2ImageRefs)

  const blob = pdf.build()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `forensic-report-${safeFilePart(report.videoName)}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
