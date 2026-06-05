const API_BASE_URL = '/api';

const getToken = () => localStorage.getItem('deepfake_token');

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readResponse = async (response: Response, fallback: string) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      throw new Error(payload.errors.map((err: any) => err.message).join('\n'));
    }
    throw new Error(payload.error || payload.message || fallback);
  }
  return payload;
};

export const apiService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return readResponse(response, 'Login failed');
  },

  async signup(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    return readResponse(response, 'Signup failed');
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Session expired');
  },

  // Upload video
  async uploadVideo(file: File, context?: { sourceUrl?: string; claim?: string; verificationMode?: 'news-video' }) {
    const formData = new FormData();
    formData.append('video', file);

    if (context?.verificationMode) {
      formData.append('verificationMode', context.verificationMode);
    }
    if (context?.sourceUrl) {
      formData.append('sourceUrl', context.sourceUrl);
    }
    if (context?.claim) {
      formData.append('claim', context.claim);
    }

    const response = await fetch(`${API_BASE_URL}/video/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    return readResponse(response, 'Upload failed');
  },

  // Start analysis
  async startAnalysis(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/analysis/start/${videoId}`, {
      method: 'POST',
      headers: authHeaders(),
    });

    return readResponse(response, 'Analysis start failed');
  },

  // Get analysis status
  async getAnalysisStatus(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/analysis/status/${videoId}`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Status check failed');
  },

  // Get results
  async getResults(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/results/${videoId}`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Results fetch failed');
  },

  // Get video list
  async getVideoList() {
    const response = await fetch(`${API_BASE_URL}/video`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Video list fetch failed');
  },

  // Get video details
  async getVideo(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/video/${videoId}`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Video fetch failed');
  },

  async deleteVideo(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/video/${videoId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return readResponse(response, 'Delete failed');
  },

  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Admin stats fetch failed');
  },

  async getAdminVideos() {
    const response = await fetch(`${API_BASE_URL}/admin/videos?limit=100`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Admin videos fetch failed');
  },

  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: authHeaders(),
    });

    return readResponse(response, 'Admin users fetch failed');
  },

  async deleteAdminUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return readResponse(response, 'User delete failed');
  },

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};
