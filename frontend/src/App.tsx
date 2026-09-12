import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout.js";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.js";
import { HomePage } from "./pages/HomePage.js";
import { DoctorsListPage } from "./pages/DoctorsListPage.js";
import { DoctorDetailsPage } from "./pages/DoctorDetailsPage.js";
import { BookingPage } from "./pages/BookingPage.js";
import { ConfirmationPage } from "./pages/ConfirmationPage.js";
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage.js";
import { AppointmentDetailsPage } from "./pages/AppointmentDetailsPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="doctors" element={<DoctorsListPage />} />
        <Route path="doctors/:doctorId" element={<DoctorDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="book/:doctorId" element={<BookingPage />} />
          <Route path="appointments" element={<MyAppointmentsPage />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetailsPage />} />
          <Route path="appointments/:appointmentId/confirmation" element={<ConfirmationPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
