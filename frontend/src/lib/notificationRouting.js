const ELEVATED_ROLES = new Set(['admin', 'owner', 'staff']);

export function getNotificationBookingId(notification) {
  return notification?.data?.booking_id || notification?.metadata?.booking_id || '';
}

export function getNotificationTarget(notification, role) {
  const bookingId = getNotificationBookingId(notification);
  if (!bookingId) return '';

  if (ELEVATED_ROLES.has(role)) {
    return `/admin/bookings?booking_id=${encodeURIComponent(bookingId)}`;
  }

  if (notification?.type === 'payment_confirmed') {
    return `/booking/success?booking_id=${encodeURIComponent(bookingId)}`;
  }

  return `/my-profile/bookings/${encodeURIComponent(bookingId)}`;
}
