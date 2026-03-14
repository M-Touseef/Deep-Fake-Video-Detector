const API_BASE_URL = '/api';

export const apiService = {
  // Upload video
  async uploadVideo(file: File, userId?: string) {
    const formData = new FormData();
    formData.append('video', file);
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await fetch(`${API_BASE_URL}/video/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  // Start analysis
  async startAnalysis(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/analysis/start/${videoId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis start failed');
    }

    return response.json();
  },

  // Get analysis status
  async getAnalysisStatus(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/analysis/status/${videoId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Status check failed');
    }

    return response.json();
  },

  // Get results
  async getResults(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/results/${videoId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Results fetch failed');
    }

    return response.json();
  },

  // Get video list
  async getVideoList(userId?: string) {
    const url = userId ? `${API_BASE_URL}/video?userId=${userId}` : `${API_BASE_URL}/video`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Video list fetch failed');
    }

    return response.json();
  },

  // Get video details
  async getVideo(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/video/${videoId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Video fetch failed');
    }

    return response.json();
  },

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};
