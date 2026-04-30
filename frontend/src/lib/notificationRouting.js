const ELEVATED_ROLES = new Set(['admin', 'owner', 'staff']);
const GUEST_BOOKING_SUCCESS_TYPES = new Set(['payment_confirmed']);

export function getNotificationBookingId(notification) {
  return notification?.data?.booking_id || notification?.metadata?.booking_id || '';
}

export function getNotificationTarget(notification, role) {
  const bookingId = getNotificationBookingId(notification);
  if (!bookingId) return '';

  if (ELEVATED_ROLES.has(role)) {
    return `/admin/bookings?booking_id=${encodeURIComponent(bookingId)}`;
  }

  if (GUEST_BOOKING_SUCCESS_TYPES.has(notification?.type)) {
    return `/booking/success?booking_id=${encodeURIComponent(bookingId)}&event=${encodeURIComponent(notification.type)}`;
  }

  return `/my-profile/bookings/${encodeURIComponent(bookingId)}`;
}
