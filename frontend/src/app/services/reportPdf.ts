type Segment = {
  label: string;
  timeRange: string;
  score: number;
  verdict: string;
};

type FrameEvidence = {
  rank: number;
  timestamp: string;
  score: number;
  originalBase64?: string;
  heatmapBase64: string;
  activationRegion?: string;
  regionExplanation?: string;
};

type ForensicReportData = {
  verdict: 'fake' | 'real';
  confidence: number;
  topkConfidence?: number;
  manipulatedSegments: Segment[];
  frameEvidence: FrameEvidence[];
  modelVersion: string | null;
  processingTime: number | null;
  createdAt: string;
  video: {
    filename: string;
    duration: number | null;
    fps: number | null;
    frameCount: number | null;
  };
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;

const encoder = new TextEncoder();

const toBytes = (value: string) => encoder.encode(value);

const concatBytes = (parts: Uint8Array[]) => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const escapePdfText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const safeFilePart = (value: string) =>
  value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';

const wrapText = (text: string, maxChars = 88) => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
};

const base64ToBytes = (base64: string) => {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
};

const makeWarnings = (result: ForensicReportData) => {
  const warnings: string[] = [];

  if (result.frameEvidence.length === 0) {
    warnings.push('No Grad-CAM frame evidence was returned. Review analysis logs before making a decision.');
  }

  if (result.frameEvidence.length < 3) {
    warnings.push('Fewer than three evidence frames were available, so visual evidence is limited.');
  }

  if ((result.video.frameCount || 0) < 16) {
    warnings.push('Video has fewer frames than the standard 16-frame sampling target.');
  }

  if ((result.confidence || 0) < 0.6) {
    warnings.push('Model confidence is low. Treat this result as inconclusive and seek human review.');
  }

  if (warnings.length === 0) {
    warnings.push('No no-face or low-quality warning was reported for this completed analysis.');
  }

  return warnings;
};

const makeConclusion = (result: ForensicReportData) => {
  const confPct = Math.round(result.confidence * 100);
  const highSegments = result.manipulatedSegments.filter(seg => seg.verdict?.toUpperCase() === 'HIGH').length;

  if (result.verdict === 'fake') {
    return `The analysed video is classified as likely manipulated with ${confPct}% confidence. ${highSegments > 0
      ? `${highSegments} high-risk temporal segment(s) and the Grad-CAM evidence should be reviewed by a human analyst.`
      : 'No high-risk temporal segment was isolated, but the overall model verdict remains suspicious.'}`;
  }

  return `The analysed video is classified as likely authentic with ${confPct}% confidence. This report should be treated as decision support, not as sole legal or forensic proof.`;
};

class PdfBuilder {
  private objects: Uint8Array[] = [new Uint8Array()];
  private pageIds: number[] = [];
  private catalogId: number;
  private pagesId: number;
  private fontId: number;

  constructor() {
    this.catalogId = this.addObject('');
    this.pagesId = this.addObject('');
    this.fontId = this.addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  }

  addObject(value: string | Uint8Array) {
    this.objects.push(typeof value === 'string' ? toBytes(value) : value);
    return this.objects.length - 1;
  }

  setObject(id: number, value: string | Uint8Array) {
    this.objects[id] = typeof value === 'string' ? toBytes(value) : value;
  }

  addPage(commands: string[], images: Array<{ name: string; bytes: Uint8Array; x: number; y: number; size: number }>) {
    const imageRefs = images.map(image => {
      const imageObject = concatBytes([
        toBytes(`<< /Type /XObject /Subtype /Image /Width 224 /Height 224 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),
        image.bytes,
        toBytes('\nendstream'),
      ]);
      return { ...image, objectId: this.addObject(imageObject) };
    });

    const imageCommands = imageRefs.map(image =>
      `q\n${image.size} 0 0 ${image.size} ${image.x} ${image.y} cm\n/${image.name} Do\nQ`
    );
    const content = [...commands, ...imageCommands].join('\n');
    const contentObject = `<< /Length ${toBytes(content).length} >>\nstream\n${content}\nendstream`;
    const contentId = this.addObject(contentObject);
    const xObjects = imageRefs.length
      ? `/XObject << ${imageRefs.map(image => `/${image.name} ${image.objectId} 0 R`).join(' ')} >>`
      : '';
    const pageId = this.addObject(
      `<< /Type /Page /Parent ${this.pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${this.fontId} 0 R >> ${xObjects} >> /Contents ${contentId} 0 R >>`
    );
    this.pageIds.push(pageId);
  }

  build() {
    this.setObject(
      this.pagesId,
      `<< /Type /Pages /Kids [${this.pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${this.pageIds.length} >>`
    );
    this.setObject(this.catalogId, `<< /Type /Catalog /Pages ${this.pagesId} 0 R >>`);

    const chunks: Uint8Array[] = [toBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
    const offsets = [0];
    let offset = chunks[0].length;

    for (let id = 1; id < this.objects.length; id += 1) {
      offsets[id] = offset;
      const objectBytes = concatBytes([
        toBytes(`${id} 0 obj\n`),
        this.objects[id],
        toBytes('\nendobj\n'),
      ]);
      chunks.push(objectBytes);
      offset += objectBytes.length;
    }

    const xrefOffset = offset;
    const xref = [
      'xref',
      `0 ${this.objects.length}`,
      '0000000000 65535 f ',
      ...offsets.slice(1).map(value => `${String(value).padStart(10, '0')} 00000 n `),
      'trailer',
      `<< /Size ${this.objects.length} /Root ${this.catalogId} 0 R >>`,
      'startxref',
      String(xrefOffset),
      '%%EOF',
      '',
    ].join('\n');
    chunks.push(toBytes(xref));

    return new Blob(chunks, { type: 'application/pdf' });
  }
}

const addText = (commands: string[], text: string, x: number, y: number, size = 10) => {
  commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
};

const addWrappedText = (commands: string[], text: string, x: number, y: number, size = 10, maxChars = 88) => {
  let currentY = y;
  for (const line of wrapText(text, maxChars)) {
    addText(commands, line, x, currentY, size);
    currentY -= size + 5;
  }
  return currentY;
};

const addSectionTitle = (commands: string[], title: string, y: number) => {
  addText(commands, title, MARGIN, y, 14);
  commands.push(`${MARGIN} ${y - 8} ${PAGE_WIDTH - MARGIN * 2} 0.8 re f`);
  return y - 26;
};

export const downloadForensicReportPdf = (result: ForensicReportData) => {
  const pdf = new PdfBuilder();
  const confPct = Math.round(result.confidence * 100);
  const topkPct = result.topkConfidence ? Math.round(result.topkConfidence * 100) : null;
  const warnings = makeWarnings(result);
  const conclusion = makeConclusion(result);
  const reportDate = new Date().toLocaleString();
  const analysisDate = new Date(result.createdAt).toLocaleString();
  const verdictLabel = result.verdict === 'fake' ? 'Likely Manipulated' : 'Likely Authentic';

  const page1: string[] = [];
  addText(page1, 'ProofOfReality Forensic Evidence Report', MARGIN, 790, 20);
  addText(page1, `Generated: ${reportDate}`, MARGIN, 766, 10);
  addText(page1, `Analysed: ${analysisDate}`, MARGIN, 750, 10);

  let y = addSectionTitle(page1, 'Final Verdict', 714);
  addText(page1, `Verdict: ${verdictLabel}`, MARGIN, y, 14);
  y -= 22;
  addText(page1, `Detection confidence: ${confPct}%`, MARGIN, y, 12);
  y -= 18;
  if (topkPct !== null) {
    addText(page1, `Top-K confidence: ${topkPct}%`, MARGIN, y, 12);
    y -= 18;
  }
  addText(page1, `Model version: ${result.modelVersion || 'Not reported'}`, MARGIN, y, 11);
  y -= 18;
  addText(page1, `Processing time: ${result.processingTime ? `${(result.processingTime / 1000).toFixed(1)}s` : 'Not reported'}`, MARGIN, y, 11);

  y = addSectionTitle(page1, 'Video Metadata', y - 36);
  [
    `Filename: ${result.video.filename || 'Unknown'}`,
    `Duration: ${result.video.duration ? `${result.video.duration.toFixed(1)}s` : 'Not reported'}`,
    `Frame rate: ${result.video.fps ? `${result.video.fps} fps` : 'Not reported'}`,
    `Frame count: ${result.video.frameCount || 'Not reported'}`,
  ].forEach(line => {
    addText(page1, line, MARGIN, y, 11);
    y -= 17;
  });

  y = addSectionTitle(page1, 'Warnings', y - 20);
  warnings.forEach(warning => {
    y = addWrappedText(page1, `- ${warning}`, MARGIN, y, 10, 94) - 3;
  });

  y = addSectionTitle(page1, 'Human-Readable Conclusion', y - 16);
  addWrappedText(page1, conclusion, MARGIN, y, 11, 86);

  pdf.addPage(page1, []);

  const page2: string[] = [];
  y = 790;
  y = addSectionTitle(page2, 'Segment Timeline', y);
  if (result.manipulatedSegments.length === 0) {
    addText(page2, 'No segment-level evidence was returned.', MARGIN, y, 11);
    y -= 20;
  } else {
    result.manipulatedSegments.forEach(segment => {
      addText(page2, `${segment.label} | ${segment.timeRange} | ${segment.verdict} | ${segment.score.toFixed(1)}%`, MARGIN, y, 11);
      y -= 12;
      commandsBar(page2, MARGIN, y, Math.min(segment.score, 100), segment.verdict);
      y -= 22;
    });
  }

  y = addSectionTitle(page2, 'Top Suspicious Frames and Grad-CAM Heatmaps', y - 12);
  const images: Array<{ name: string; bytes: Uint8Array; x: number; y: number; size: number }> = [];
  result.frameEvidence.slice(0, 3).forEach((frame, index) => {
    const rowY = y - index * 185;
    addText(page2, `Frame #${frame.rank}`, MARGIN, rowY, 12);
    addText(page2, `Timestamp: ${frame.timestamp}`, MARGIN, rowY - 18, 10);
    addText(page2, `Suspicion score: ${frame.score.toFixed(1)}%`, MARGIN, rowY - 34, 10);
    addText(page2, `Region: ${frame.activationRegion || 'Model-highlighted facial region'}`, MARGIN, rowY - 50, 10);
    if (frame.regionExplanation) {
      addWrappedText(page2, frame.regionExplanation, MARGIN, rowY - 66, 8, 50);
    }
    if (frame.originalBase64) {
      addText(page2, 'Original', 305, rowY + 2, 8);
      images.push({
        name: `Orig${index + 1}`,
        bytes: base64ToBytes(frame.originalBase64),
        x: 305,
        y: rowY - 118,
        size: 112,
      });
    }
    if (frame.heatmapBase64) {
      addText(page2, 'Grad-CAM', 435, rowY + 2, 8);
      images.push({
        name: `Heat${index + 1}`,
        bytes: base64ToBytes(frame.heatmapBase64),
        x: 435,
        y: rowY - 118,
        size: 112,
      });
    }
  });

  if (result.frameEvidence.length === 0) {
    addText(page2, 'No Grad-CAM image evidence was returned.', MARGIN, y, 11);
  }

  pdf.addPage(page2, images);

  const blob = pdf.build();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `forensic-report-${safeFilePart(result.video.filename)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const commandsBar = (commands: string[], x: number, y: number, score: number, verdict: string) => {
  const width = 330;
  const filled = (score / 100) * width;
  const color = verdict?.toUpperCase() === 'HIGH'
    ? '0.93 0.27 0.27'
    : verdict?.toUpperCase() === 'MEDIUM'
      ? '0.96 0.57 0.15'
      : '0.20 0.72 0.39';

  commands.push('0.88 0.90 0.94 rg');
  commands.push(`${x} ${y} ${width} 8 re f`);
  commands.push(`${color} rg`);
  commands.push(`${x} ${y} ${filled} 8 re f`);
  commands.push('0 0 0 rg');
};
