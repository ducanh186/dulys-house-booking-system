import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import SearchResultPage from './pages/public/SearchResultPage';
import HomestayDetailPage from './pages/public/HomestayDetailPage';
import BookingPage from './pages/public/BookingPage';
import BookingSuccessPage from './pages/public/BookingSuccessPage';
import MyBookingsPage from './pages/public/MyBookingsPage';

import DashboardPage from './pages/admin/DashboardPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import HomestayManagementPage from './pages/admin/HomestayManagementPage';
import RoomManagementPage from './pages/admin/RoomManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import PaymentManagementPage from './pages/admin/PaymentManagementPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/homestays/:slug" element={<HomestayDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/booking/success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'owner', 'staff']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingManagementPage />} />
            <Route path="homestays" element={<HomestayManagementPage />} />
            <Route path="rooms" element={<RoomManagementPage />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="payments" element={<PaymentManagementPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
