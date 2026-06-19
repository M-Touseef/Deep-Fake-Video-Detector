export const heroBadges = [
  'Frame-Level Analysis',
  'Grad-CAM Heatmaps',
  'Fake/Real Prediction',
  'PDF Report',
]

export const detectionSteps = [
  { number: '01', title: 'Upload Video', description: 'Upload a suspicious video for deepfake analysis.', icon: '/icons/upload-video.svg', animation: '-translate-y-1' },
  { number: '02', title: 'Extract Frames', description: 'The system extracts selected frames from the uploaded video.', icon: '/icons/film-strip.svg', animation: 'translate-x-1' },
  { number: '03', title: 'Detect Faces', description: 'Faces are detected and cropped from each extracted frame.', icon: '/icons/face-scan.svg', animation: 'scale-105', scan: true },
  { number: '04', title: 'AI Analysis', description: 'EfficientNet-B0 and Transformer Encoder analyze facial and temporal patterns.', icon: '/icons/ai-analysis.svg', animation: 'animate-pulse scale-105' },
  { number: '05', title: 'Generate Heatmaps', description: 'Grad-CAM highlights facial regions that influenced the prediction.', icon: '/icons/heatmap-face.svg', animation: 'animate-pulse drop-shadow-[0_0_10px_rgba(255,81,86,.85)]' },
  { number: '06', title: 'PDF Report', description: 'The final result, confidence score, frame comparison, and explanation are exported as a PDF report.', icon: '/icons/pdf-report.svg', animation: '-rotate-3 translate-x-0.5' },
]

export const realWorldCases = [
  { title: 'Fake News Clip', probability: 89, authenticity: 11, status: 'High Risk', regions: ['Mouth', 'Eyes', 'Face Boundary'], originalImage: '/images/cases/fake-news-frame.png', heatmapImage: '/images/cases/fake-news-heatmap.png', explanation: 'Heatmap highlights suspicious facial expression and lip movement patterns.' },
  { title: 'Video Call Identity Fraud', probability: 76, authenticity: 24, status: 'Suspicious', regions: ['Eyes', 'Cheeks', 'Skin Texture'], originalImage: '/images/cases/video-call-fraud-frame.png', heatmapImage: '/images/cases/video-call-heatmap.png', explanation: 'The system detected unnatural facial texture and inconsistent landmarks.' },
  { title: 'Social Media Deepfake', probability: 68, authenticity: 32, status: 'Suspicious', regions: ['Jawline', 'Mouth', 'Blending Area'], originalImage: '/images/cases/social-media-frame.png', heatmapImage: '/images/cases/social-media-heatmap.png', explanation: 'Frame analysis shows possible face-swap boundaries.' },
  { title: 'Interview Manipulation', probability: 92, authenticity: 8, status: 'High Risk', regions: ['Lips', 'Nose', 'Facial Edges'], originalImage: '/images/cases/interview-frame.png', heatmapImage: '/images/cases/interview-heatmap.png', explanation: 'Temporal analysis detected unnatural movement across multiple frames.' },
  { title: 'Authentic Video Sample', probability: 12, authenticity: 88, status: 'Low Risk', regions: ['None Significant'], originalImage: '/images/cases/authentic-video-frame.png', heatmapImage: '/images/cases/authentic-video-heatmap.png', explanation: 'No strong manipulation pattern was detected across analyzed frames.' },
]

export const features = [
  { title: 'Video Upload & Validation', description: 'Upload suspicious videos and validate supported file formats before analysis.', tag: 'MP4 / AVI / MOV', icon: '/icons/upload-video.svg', accent: 'cyan', animation: 'group-hover:-translate-y-1' },
  { title: 'Frame Extraction', description: 'Extract selected frames from the uploaded video for frame-level analysis.', tag: 'Frame-Level Processing', icon: '/icons/frame-extraction.svg', accent: 'blue', animation: 'group-hover:translate-x-1' },
  { title: 'Face Detection', description: 'Detect and crop facial regions from extracted frames for deepfake analysis.', tag: 'Face Region Detection', icon: '/icons/face-detection.svg', accent: 'cyan', animation: 'group-hover:scale-105', scan: true },
  { title: 'AI-Based Classification', description: 'Use EfficientNet-B0 and Transformer Encoder to classify videos as Real or Fake.', tag: 'EfficientNet-B0 + Transformer', icon: '/icons/ai-classification.svg', accent: 'violet', animation: 'group-hover:animate-pulse group-hover:scale-105' },
  { title: 'Grad-CAM Heatmap Explanation', description: 'Highlight facial regions that influenced the model decision using heatmaps.', tag: 'Explainable AI', icon: '/icons/heatmap-explanation.svg', accent: 'red', animation: 'group-hover:animate-pulse group-hover:drop-shadow-[0_0_10px_rgba(248,113,113,.75)]' },
  { title: 'Frame-Level Analysis', description: 'Show original frames, heatmap frames, fake probability, and affected regions.', tag: 'Original vs Heatmap', icon: '/icons/frame-analysis.svg', accent: 'amber', animation: 'group-hover:translate-x-1' },
  { title: 'Result Dashboard', description: 'Display final prediction, fake probability, authenticity score, and confidence.', tag: 'Detection Summary', icon: '/icons/result-dashboard.svg', accent: 'emerald', animation: 'group-hover:scale-105' },
  { title: 'PDF Report Generation', description: 'Generate a downloadable PDF report with results, frame comparisons, and explanations.', tag: 'Downloadable Report', icon: '/icons/pdf-report.svg', accent: 'cyan', animation: 'group-hover:-rotate-3 group-hover:translate-x-0.5' },
]

export const riskStyles = {
  'High Risk': 'border-red-400/25 bg-red-400/10 text-red-300',
  Suspicious: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
  'Low Risk': 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
}

export const entranceDelays = ['delay-[320ms]', 'delay-[440ms]', 'delay-[560ms]', 'delay-[680ms]', 'delay-[800ms]', 'delay-[920ms]']
export const badgeDelays = ['delay-[1100ms]', 'delay-[1220ms]', 'delay-[1340ms]', 'delay-[1460ms]']
