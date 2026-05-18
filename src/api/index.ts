const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
    me: () => req<any>('/auth/me', { headers: authHeaders() }),
  },

  universities: {
    list: () => req<any[]>('/universities'),
    get: (id: string) => req<any>(`/universities/${id}`),
  },

  students: {
    list: () => req<any[]>('/students', { headers: authHeaders() }),
    create: (data: any) => req<any>('/students', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    }),
    me: () => req<any>('/students/me', { headers: authHeaders() }),
    updateMe: (data: any) => req<any>('/students/me', {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    }),
    get: (id: string) => req<any>(`/students/${id}`, { headers: authHeaders() }),
    updateDocument: (studentId: string, docId: string, status: string) =>
      req<any>(`/students/${studentId}/documents/${docId}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }),
      }),
    addDocument: (data: { name: string; type: string }) =>
      req<any>('/students/me/documents', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
      }),
    requestDocument: (studentId: string, data: { name: string; type: string }) =>
      req<any>(`/students/${studentId}/documents`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
      }),
  },

  applications: {
    list: () => req<any[]>('/applications', { headers: authHeaders() }),
    create: (data: any) => req<any>('/applications', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    }),
    update: (appId: string, data: any) => req<any>(`/applications/${appId}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    }),
  },

  chat: {
    rooms: () => req<any[]>('/chat/rooms', { headers: authHeaders() }),
    room: (roomId: string) => req<any>(`/chat/rooms/${roomId}`, { headers: authHeaders() }),
    send: (roomId: string, content: string, senderName: string) =>
      req<any>(`/chat/rooms/${roomId}/messages`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ content, senderName }),
      }),
    createRoom: (participantIds: string[], participantNames: string[]) =>
      req<any>('/chat/rooms', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ participantIds, participantNames }),
      }),
    logCall: (participantIds: string[], callStatus: string, callDuration: number, callerName: string) =>
      req<any>('/chat/rooms/call-log', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ participantIds, callStatus, callDuration, callerName }),
      }),
  },

  admin: {
    stats: () => req<any>('/admin/stats', { headers: authHeaders() }),
    counselors: () => req<any[]>('/admin/counselors', { headers: authHeaders() }),
    createCounselor: (data: any) => req<any>('/admin/counselors', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    }),
    updateCounselor: (id: string, data: any) => req<any>(`/admin/counselors/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    }),
    deleteCounselor: (id: string) => req<any>(`/admin/counselors/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    }),
    students: () => req<any[]>('/admin/students', { headers: authHeaders() }),
    createStudent: (data: any) => req<any>('/admin/students', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    }),
    updateStudentStatus: (id: string, status: string) => req<any>(`/admin/students/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }),
    }),
    deleteStudent: (id: string) => req<any>(`/admin/students/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    }),
    applications: () => req<any[]>('/admin/applications', { headers: authHeaders() }),
    updateApplication: (studentId: string, appId: string, data: { status?: string; notes?: string }) =>
      req<any>(`/admin/applications/${studentId}/${appId}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
      }),
  },
};
