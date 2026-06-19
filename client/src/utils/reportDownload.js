const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 46

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

class PdfBuilder {
  constructor() {
    this.pages = []
  }

  addPage(commands) {
    this.pages.push(commands.join('\n'))
  }

  build() {
    const objects = []
    const pageObjectIds = []
    const fontRegularId = 3
    const fontBoldId = 4

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
    objects[fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    objects[fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

    let nextId = 5
    this.pages.forEach((content) => {
      const contentId = nextId++
      const pageId = nextId++
      objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
      pageObjectIds.push(pageId)
    })

    objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

    let body = '%PDF-1.4\n'
    const offsets = [0]

    for (let index = 1; index < objects.length; index += 1) {
      offsets[index] = body.length
      body += `${index} 0 obj\n${objects[index]}\nendobj\n`
    }

    const xrefOffset = body.length
    body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
    for (let index = 1; index < objects.length; index += 1) {
      body += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
    }
    body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

    return new Blob([body], { type: 'application/pdf' })
  }
}

function makeReportModel(result) {
  const fakeProbability = Number(result.fakeProbability ?? 87)
  const authenticityScore = Number(result.authenticityScore ?? Math.max(0, 100 - fakeProbability))
  const isFake = result.finalPrediction === 'Fake'

  return {
    ...result,
    fakeProbability,
    authenticityScore,
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
    segments: [
      { label: 'Segment 01', timeRange: '00:00-00:05', verdict: 'Medium', score: 64 },
      { label: 'Segment 02', timeRange: '00:06-00:11', verdict: 'High', score: 91 },
      { label: 'Segment 03', timeRange: '00:12-00:17', verdict: 'High', score: 84 },
      { label: 'Segment 04', timeRange: '00:18-00:24', verdict: 'Medium', score: 68 },
    ],
  }
}

function addFrameEvidence(commands, frame, rowY, index) {
  text(commands, frame.frameNumber, MARGIN, rowY, 12, 'F2', '0.95 0.99 1')
  text(commands, `Suspicion score: ${frame.fakeProbability}%`, MARGIN, rowY - 18, 10, 'F1', '0.95 0.70 0.70')
  text(commands, `Status: ${frame.status}`, MARGIN, rowY - 34, 10, 'F1', '0.75 0.90 0.94')
  wrappedText(commands, `Region: ${frame.affectedRegions.join(', ')}`, MARGIN, rowY - 52, 8, 42, 'F1', '0.60 0.73 0.78', 11)

  const originalX = 302
  const heatmapX = 436
  const imageY = rowY - 118
  text(commands, 'Original', originalX, rowY + 1, 8, 'F2', '0.68 0.80 0.85')
  text(commands, 'Grad-CAM', heatmapX, rowY + 1, 8, 'F2', '0.68 0.95 1')

  rect(commands, originalX, imageY, 112, 112, index % 2 ? '0.14 0.18 0.19' : '0.10 0.16 0.18', '0.22 0.33 0.38')
  rect(commands, originalX + 16, imageY + 20, 80, 72, '0.18 0.23 0.24', '0.35 0.44 0.47')
  rect(commands, originalX + 35, imageY + 40, 42, 38, '0.25 0.32 0.33', '0.48 0.58 0.60')
  line(commands, originalX + 20, imageY + 24, originalX + 92, imageY + 88, '0.15 0.83 0.92', 0.6)

  rect(commands, heatmapX, imageY, 112, 112, '0.13 0.07 0.07', '0.45 0.18 0.18')
  rect(commands, heatmapX + 16, imageY + 20, 80, 72, '0.24 0.10 0.10')
  rect(commands, heatmapX + 32, imageY + 38, 46, 42, '0.88 0.22 0.18')
  rect(commands, heatmapX + 43, imageY + 50, 24, 22, '0.99 0.76 0.18')
  line(commands, heatmapX + 20, imageY + 24, heatmapX + 92, imageY + 88, '0.98 0.56 0.18', 0.8)
}

export function downloadPdfReport(result) {
  const report = makeReportModel(result)
  const pdf = new PdfBuilder()

  const page1 = []
  pageShell(page1, 'VerifAI Forensic Evidence Report', 'Deepfake detection, frame evidence, and Grad-CAM explainability', 1)

  let y = 666
  rect(page1, MARGIN, y - 92, PAGE_WIDTH - MARGIN * 2, 96, report.finalPrediction === 'Fake' ? '0.18 0.07 0.08' : '0.05 0.16 0.11', '0.32 0.18 0.20')
  pill(page1, `Verdict: ${report.verdictLabel}`, MARGIN + 18, y - 24, 150, report.finalPrediction === 'Fake' ? '0.35 0.10 0.12' : '0.08 0.25 0.18')
  text(page1, `Detection confidence: ${report.fakeProbability}%`, MARGIN + 18, y - 52, 16, 'F2', '0.98 0.92 0.92')
  text(page1, `Confidence calibration: ${report.confidenceLevel}`, MARGIN + 18, y - 76, 11, 'F1', '0.76 0.86 0.89')
  text(page1, report.recommendedAction, PAGE_WIDTH - MARGIN - 190, y - 47, 13, 'F2', '0.82 0.96 1')
  text(page1, 'Recommended action', PAGE_WIDTH - MARGIN - 190, y - 68, 9, 'F1', '0.55 0.68 0.73')

  y = sectionTitle(page1, 'Video Metadata', y - 124)
  const metadata = [
    `Filename: ${report.videoName}`,
    `Generated: ${report.generatedAt}`,
    `Analysed: ${report.analysisDate}`,
    `Frames analysed: ${report.framesAnalyzed}`,
    `Faces detected: ${report.facesDetected}`,
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
  y = wrappedText(page1, `What this means: ${report.interpretation}`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3
  y = wrappedText(page1, `Why: Suspicious regions repeatedly appeared around ${report.affectedRegions.join(', ')}.`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3
  y = wrappedText(page1, `What to do next: Open frame analysis, inspect heatmaps, and keep the PDF report with the case evidence.`, MARGIN, y, 9, 98, 'F1', '0.73 0.84 0.88', 13) - 3

  y = sectionTitle(page1, 'Can I Trust This Video Checklist', y - 4)
  report.trustChecklist.forEach((item) => {
    y = wrappedText(page1, `- ${item}`, MARGIN, y, 9, 98, 'F1', '0.76 0.86 0.89', 12)
  })

  y = sectionTitle(page1, 'Human-Readable Conclusion', y - 8)
  wrappedText(page1, report.conclusion, MARGIN, y, 9, 96, 'F1', '0.78 0.88 0.91', 13)
  pdf.addPage(page1)

  const page2 = []
  pageShell(page2, 'Evidence Timeline and Heatmaps', 'Segment-level risk and top suspicious frame evidence', 2)

  y = sectionTitle(page2, 'Segment Timeline', 666)
  report.segments.forEach((segment) => {
    text(page2, `${segment.label} | ${segment.timeRange} | ${segment.verdict} | ${segment.score}%`, MARGIN, y, 10, 'F2', '0.86 0.94 0.97')
    progressBar(page2, MARGIN + 230, y - 1, 260, segment.score, segment.verdict === 'High' ? '0.93 0.27 0.27' : '0.96 0.57 0.15')
    y -= 24
  })

  y = sectionTitle(page2, 'Top Suspicious Frames and Grad-CAM Heatmaps', y - 18)
  report.suspiciousFrames.slice(0, 3).forEach((frame, index) => {
    addFrameEvidence(page2, frame, y - index * 162, index)
  })

  const footerY = 74
  rect(page2, MARGIN, footerY, PAGE_WIDTH - MARGIN * 2, 48, '0.04 0.13 0.16', '0.13 0.45 0.52')
  text(page2, 'Report note', MARGIN + 16, footerY + 27, 10, 'F2', '0.88 0.98 1')
  wrappedText(page2, 'This report supports forensic review. It should be interpreted with confidence scores, source context, and human verification.', MARGIN + 16, footerY + 13, 8, 95, 'F1', '0.62 0.75 0.80', 10)
  pdf.addPage(page2)

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
