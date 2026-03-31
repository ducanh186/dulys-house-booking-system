const ELEVATED_ROLES = new Set(['admin', 'owner', 'staff']);

export function getNotificationBookingId(notification) {
  return notification?.data?.booking_id || notification?.metadata?.booking_id || '';
}

export function getNotificationTarget(notification, role) {
  const bookingId = getNotificationBookingId(notification);
  if (!bookingId) return '';

  const targetBase = ELEVATED_ROLES.has(role) ? '/admin/bookings' : '/my-profile/bookings';
  return `${targetBase}?booking_id=${encodeURIComponent(bookingId)}`;
}
