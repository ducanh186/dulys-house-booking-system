import client from './client';

export const getNotifications = (page) =>
  client.get('/notifications', { params: { page } });

export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  client.patch('/notifications/read-all');

export const getUnreadNotificationCount = () =>
  client.get('/notifications/unread-count');
