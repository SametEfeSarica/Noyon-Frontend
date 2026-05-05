import api from './axiosInstance';

export const noteApi = {
  getAll: async (page = 0, size = 20) => {
    const res = await api.get('/api/notes', {
      params: { page, size, sort: 'updatedAt,desc' }
    });
    return res.data.data;
  },

  getTrash: async () => {
    const res = await api.get('/api/notes/trash');
    return res.data.data;
  },

  search: async (keyword) => {
    const res = await api.get('/api/notes/search', {
      params: { keyword }
    });
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post('/api/notes', data);
    return res.data.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/notes/${id}`, data);
    return res.data.data;
  },

  softDelete: async (id) => {
    const res = await api.delete(`/api/notes/${id}`);
    return res.data.data;
  },

  restore: async (id) => {
    const res = await api.patch(`/api/notes/${id}/restore`);
    return res.data.data;
  },
};