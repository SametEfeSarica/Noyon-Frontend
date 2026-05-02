import api from './axiosInstance';

export const noteApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/api/notes', { params: { page, size, sort: 'updatedAt,desc' } }),

  getTrash: () =>
    api.get('/api/notes/trash'),

  search: (keyword) =>
    api.get('/api/notes/search', { params: { keyword } }),

  create: (data) =>
    api.post('/api/notes', data),

  update: (id, data) =>
    api.put(`/api/notes/${id}`, data),

  softDelete: (id) =>
    api.delete(`/api/notes/${id}`),

  restore: (id) =>
    api.patch(`/api/notes/${id}/restore`),
};