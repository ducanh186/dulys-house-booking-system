import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import LoginVideoPage from './pages/public/LoginVideoPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/public/ForgotPasswordVerifyPage';
import RegisterPage from './pages/public/RegisterPage';
import SearchResultPage from './pages/public/SearchResultPage';
import HomestayDetailPage from './pages/public/HomestayDetailPage';
import RoomDetailPage from './pages/public/RoomDetailPage';
import BookingPage from './pages/public/BookingPage';
import BookingSuccessPage from './pages/public/BookingSuccessPage';
import MyBookingsPage from './pages/public/MyBookingsPage';
import ReviewPage from './pages/public/ReviewPage';
import AboutPage from './pages/public/AboutPage';
import CareersPage from './pages/public/CareersPage';
import NewsPage from './pages/public/NewsPage';
import SupportContactPage from './pages/public/SupportContactPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';

import NotificationsPage from './pages/public/NotificationsPage';

import DashboardPage from './pages/admin/DashboardPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import HomestayManagementPage from './pages/admin/HomestayManagementPage';
import RoomManagementPage from './pages/admin/RoomManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import PaymentManagementPage from './pages/admin/PaymentManagementPage';
import AvailabilityPage from './pages/admin/AvailabilityPage';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import CustomerReportsPage from './pages/admin/CustomerReportsPage.jsx';

function LegacyReviewRedirect() {
  const { bookingId } = useParams();
  return <Navigate to={`/my-profile/bookings/${bookingId}/review`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/homestays/:slug" element={<HomestayDetailPage />} />
            <Route path="/homestays/:slug/rooms/:roomTypeId" element={<RoomDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/support/contact" element={<SupportContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/video" element={<LoginVideoPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/booking/success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/my-profile/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/my-profile/bookings/:bookingId/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <Navigate to="/my-profile/bookings" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings/:bookingId/review"
              element={
                <ProtectedRoute>
                  <LegacyReviewRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          </Route>
          <Route path="/staff" element={<Navigate to="/admin" replace />} />
          <Route path="/owner" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'owner', 'staff']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingManagementPage />} />
            <Route path="homestays" element={<HomestayManagementPage />} />
            <Route path="rooms" element={<RoomManagementPage />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="payments" element={<PaymentManagementPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/customers" element={<CustomerReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
