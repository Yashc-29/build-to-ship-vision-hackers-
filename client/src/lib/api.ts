const API_BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nebula_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('nebula_token');
    localStorage.removeItem('nebula_user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<any>('/auth/me'),
    logout: () => request<any>('/auth/logout', { method: 'POST' })
  },

  // Sessions & Intelligence
  sessions: {
    list: () => request<{ sessions: any[] }>('/sessions'),
    get: (id: string) => request<{ session: any; messages: any[]; memory_slots: any[] }>(`/sessions/${id}`),
    create: (body: any) => request<{ message: string; session: any }>('/sessions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ message: string; session: any }>(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ message: string }>(`/sessions/${id}`, { method: 'DELETE' }),
    sendMessage: (id: string, body: { content: string; channel?: string; language?: string }) =>
      request<{ user_message: any; assistant_message: any; intelligence: any; memory_slots: any[] }>(`/sessions/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    switchChannel: (id: string, channel: string) =>
      request<{ message: string; channel: string }>(`/sessions/${id}/channel`, {
        method: 'POST',
        body: JSON.stringify({ channel })
      }),
    end: (id: string) =>
      request<{ message: string }>(`/sessions/${id}/end`, { method: 'POST' })
  },

  // Memory Buffer
  memory: {
    get: (sessionId: string) => request<{ memory_slots: any[] }>(`/sessions/${sessionId}/memory`),
    update: (sessionId: string, slot_key: string, slot_value: string, confidence?: number) =>
      request<{ message: string }>(`/sessions/${sessionId}/memory`, {
        method: 'PUT',
        body: JSON.stringify({ slot_key, slot_value, confidence })
      })
  },

  // Sarvam AI TTS
  tts: {
    getVoices: () => request<{ sarvam_configured?: boolean; murf_configured?: boolean; speakers?: any[]; voices: any[]; default_mappings: any }>('/tts/voices'),
    generate: (body: { text?: string; inputs?: string[]; target_language_code?: string; language?: string; speaker?: string; voiceId?: string; pitch?: number; pace?: number; customApiKey?: string }) =>
      request<{ audioUrl: string | null; audioBase64: string | null; engine: string; speaker?: string; voiceId?: string; error?: string }>('/tts/generate', {
        method: 'POST',
        body: JSON.stringify(body)
      })
  },

  // Admin
  admin: {
    getStats: () => request<any>('/admin/stats')
  },

  // Health
  health: () => request<any>('/health')
};
