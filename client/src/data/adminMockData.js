export const adminMockStats = {
  totalUsers: 128,
  totalVideos: 342,
  analysesToday: 19,
  fakeDetections: 87,
  reportsGenerated: 226,
  storageUsed: '18.4 GB',
}

export const adminMockVideos = [
  { id: 'vid_2048', filename: 'sample_video.mp4', owner: 'Demo User', status: 'Completed', verdict: 'Fake', confidence: 87, uploadedAt: '14 June 2026' },
  { id: 'vid_2047', filename: 'interview_clip.mov', owner: 'Ayesha Researcher', status: 'Completed', verdict: 'Suspicious', confidence: 74, uploadedAt: '13 June 2026' },
  { id: 'vid_2046', filename: 'authentic_source.mp4', owner: 'Evaluator Team', status: 'Completed', verdict: 'Real', confidence: 91, uploadedAt: '12 June 2026' },
  { id: 'vid_2045', filename: 'social_post.mov', owner: 'General User', status: 'Processing', verdict: 'Pending', confidence: 0, uploadedAt: '12 June 2026' },
]

export const adminMockUsers = [
  { id: 'user_001', name: 'Demo User', email: 'demo@example.com', role: 'user', videos: 12, joinedAt: '01 June 2026' },
  { id: 'user_002', name: 'Ayesha Researcher', email: 'research@example.com', role: 'user', videos: 28, joinedAt: '28 May 2026' },
  { id: 'user_003', name: 'Admin User', email: 'admin@verifai.local', role: 'admin', videos: 0, joinedAt: '20 May 2026' },
  { id: 'user_004', name: 'Evaluator Team', email: 'evaluator@example.com', role: 'user', videos: 44, joinedAt: '15 May 2026' },
]
