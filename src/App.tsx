import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ModerationPage from './pages/ModerationPage';
import EventsAdminPage from './pages/EventsAdminPage';
import RestaurantsAdminPage from './pages/RestaurantsAdminPage';
import ToursAdminPage from './pages/ToursAdminPage';
import BlogAdminPage from './pages/BlogAdminPage';
import CouponsAdminPage from './pages/CouponsAdminPage';
import TicketsAdminPage from './pages/TicketsAdminPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AdvertisingPage from './pages/AdvertisingPage';
import WalletAdminPage from './pages/WalletAdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VerificationsPage from './pages/VerificationsPage';
import SettingsAdminPage from './pages/SettingsAdminPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Login — outside AdminLayout */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes — inside AdminLayout */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="moderacion" element={<ModerationPage />} />
            <Route path="eventos" element={<EventsAdminPage />} />
            <Route path="restaurantes" element={<RestaurantsAdminPage />} />
            <Route path="tours" element={<ToursAdminPage />} />
            <Route path="blog" element={<BlogAdminPage />} />
            <Route path="cupones" element={<CouponsAdminPage />} />
            <Route path="tickets" element={<TicketsAdminPage />} />
            <Route path="tickets-admin" element={<TicketsAdminPage />} />
            <Route path="suscripciones" element={<SubscriptionsPage />} />
            <Route path="publicidad" element={<AdvertisingPage />} />
            <Route path="advertising" element={<AdvertisingPage />} />
            <Route path="wallet" element={<WalletAdminPage />} />
            <Route path="wallets" element={<WalletAdminPage />} />
            <Route path="analiticas" element={<AnalyticsPage />} />
            <Route path="verificaciones" element={<VerificationsPage />} />
            <Route path="verifications" element={<VerificationsPage />} />
            <Route path="configuracion" element={<SettingsAdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
