const BASE_URL = '/api/v1'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(`Login failed: ${res.status}`)
    return res.json()
  },

  register: async (email: string, username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`)
    return res.json()
  },

  // Projects
  getProjects: () => fetchApi<Project[]>('/projects'),
  createProject: (data: Partial<Project>) => fetchApi<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchApi(`/projects/${id}`, { method: 'DELETE' }),
  
  // Conversations
  getConversations: (projectId?: string) => fetchApi<Conversation[]>(`/chat/conversations${projectId ? `?project_id=${projectId}` : ''}`),
  createConversation: (data: Partial<Conversation>) => fetchApi<Conversation>('/chat/conversations', { method: 'POST', body: JSON.stringify(data) }),
  deleteConversation: (id: string) => fetchApi(`/chat/conversations/${id}`, { method: 'DELETE' }),
  
  // Messages
  getMessages: (conversationId: string) => fetchApi<Message[]>(`/chat/conversations/${conversationId}/messages`),
  
  // Memories
  getMemories: () => fetchApi<Memory[]>('/memory'),
  createMemory: (data: Partial<Memory>) => fetchApi<Memory>('/memory', { method: 'POST', body: JSON.stringify(data) }),
  deleteMemory: (id: string) => fetchApi(`/memory/${id}`, { method: 'DELETE' }),
  
  // Skills
  getSkills: () => fetchApi<Skill[]>('/skills'),
  createSkill: (data: Partial<Skill>) => fetchApi<Skill>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (id: string) => fetchApi(`/skills/${id}`, { method: 'DELETE' }),
  
  // Files
  uploadFile: (file: File, conversationId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (conversationId) formData.append('conversation_id', conversationId)
    const token = localStorage.getItem('token')
    return fetch(`${BASE_URL}/files/upload`, { 
      method: 'POST', 
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
  },
  
  // Analytics
  getAnalyticsToday: () => fetchApi('/analytics/usage/today'),
  getAnalyticsDaily: (days: number) => fetchApi(`/analytics/usage/daily?days=${days}`),
  getAnalyticsSummary: (start?: string, end?: string) => {
    const params = new URLSearchParams()
    if (start) params.set('start_date', start)
    if (end) params.set('end_date', end)
    return fetchApi(`/analytics/usage/summary?${params}`)
  },
}
