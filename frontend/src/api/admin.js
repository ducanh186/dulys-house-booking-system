import client from './client';

// Dashboard
export const getDashboardSummary = () =>
  client.get('/admin/dashboard/summary');

export const getDashboardRevenue = () =>
  client.get('/admin/dashboard/revenue');

// Homestays CRUD
export const getAdminHomestays = (page = 1) =>
  client.get('/admin/homestays', { params: { page } });

export const getAdminHomestay = (id) =>
  client.get(`/admin/homestays/${id}`);

export const createHomestay = (data) =>
  client.post('/admin/homestays', data);

export const updateHomestay = (id, data) =>
  client.put(`/admin/homestays/${id}`, data);

export const deleteHomestay = (id) =>
  client.delete(`/admin/homestays/${id}`);

// Room Types CRUD
export const getRoomTypes = (page = 1) =>
  client.get('/admin/room-types', { params: { page } });

export const getRoomType = (id) =>
  client.get(`/admin/room-types/${id}`);

export const createRoomType = (data) =>
  client.post('/admin/room-types', data);

export const updateRoomType = (id, data) =>
  client.put(`/admin/room-types/${id}`, data);

export const deleteRoomType = (id) =>
  client.delete(`/admin/room-types/${id}`);

// Rooms CRUD
export const getRooms = (page = 1) =>
  client.get('/admin/rooms', { params: { page } });

export const getRoom = (id) =>
  client.get(`/admin/rooms/${id}`);

export const createRoom = (data) =>
  client.post('/admin/rooms', data);

export const updateRoom = (id, data) =>
  client.put(`/admin/rooms/${id}`, data);

export const deleteRoom = (id) =>
  client.delete(`/admin/rooms/${id}`);

export const updateRoomStatus = (id, status) =>
  client.patch(`/admin/rooms/${id}/status`, { status });

// Bookings management
export const getAdminBookings = (page = 1) =>
  client.get('/admin/bookings', { params: { page } });

export const getAdminBooking = (id) =>
  client.get(`/admin/bookings/${id}`);

export const confirmBooking = (id) =>
  client.patch(`/admin/bookings/${id}/confirm`);

export const checkInBooking = (id) =>
  client.patch(`/admin/bookings/${id}/check-in`);

export const checkOutBooking = (id) =>
  client.patch(`/admin/bookings/${id}/check-out`);

export const cancelAdminBooking = (id) =>
  client.patch(`/admin/bookings/${id}/cancel`);

// Payments
export const getPayments = (page = 1) =>
  client.get('/admin/payments', { params: { page } });

export const createPayment = (data) =>
  client.post('/admin/payments', data);

// Customers
export const getCustomers = (page = 1) =>
  client.get('/admin/customers', { params: { page } });

export const getCustomer = (id) =>
  client.get(`/admin/customers/${id}`);
