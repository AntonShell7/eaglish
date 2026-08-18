import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Reading from "@/pages/Reading";
import Writing from "@/pages/Writing";
import Listening from "@/pages/Listening";
import Vocabulary from "@/pages/Vocabulary";
import EverydayEnglish from "@/pages/EverydayEnglish";
import ProgressPage from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";

export default function App() {
  return (
    <Routes>
      {/* Deliberately outside <Layout>: the flow needs the whole screen. */}
      <Route path="onboarding" element={<Onboarding />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="reading" element={<Reading />} />
        <Route path="writing" element={<Writing />} />
        <Route path="listening" element={<Listening />} />
        <Route path="vocabulary" element={<Vocabulary />} />
        <Route path="everyday-english" element={<EverydayEnglish />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
