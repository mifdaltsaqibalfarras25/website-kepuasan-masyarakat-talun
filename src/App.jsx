import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SurveiApp from "./SurveiApp"; // Halaman Public (yang tadi)

// Import Halaman Admin
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import QuestionPage from "./pages/admin/QuestionPage";
import FeedbackPage from "./pages/admin/FeedbackPage";

// Komponen Pelindung Rute
const ProtectedRoute = ({ children }) => {
  // Cek apakah ada data sesi admin di LocalStorage
  const session = localStorage.getItem("admin_session");

  if (!session) {
    // Kalau tidak ada sesi, tendang ke halaman login
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rute Publik (Warga) */}
        <Route path="/" element={<SurveiApp />} />

        {/* 2. Rute Login Admin */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Rute Dashboard Admin (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Anak-anak rute (akan muncul di tempat <Outlet />) */}
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="questions" element={<QuestionPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
