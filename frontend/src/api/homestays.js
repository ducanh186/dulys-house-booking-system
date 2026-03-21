import client from './client';

export const getHomestays = (page = 1) =>
  client.get('/homestays', { params: { page } });

export const getHomestay = (id) =>
  client.get(`/homestays/${id}`);

export const searchAvailability = (params) =>
  client.post('/search/availability', params);
