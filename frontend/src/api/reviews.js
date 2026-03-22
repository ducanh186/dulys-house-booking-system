import client from './client';

export const createReview = (data) => client.post('/reviews', data);
export const getHomestayReviews = (slug, page) =>
  client.get(`/homestays/${slug}/reviews`, { params: { page } });
