import client from './client';

export const getMyBookings = (page = 1) =>
  client.get('/bookings', { params: { page } });

export const getBooking = (id) =>
  client.get(`/bookings/${id}`);

export const createBooking = (data) =>
  client.post('/bookings', data);

export const cancelBooking = (id) =>
  client.patch(`/bookings/${id}/cancel`);
