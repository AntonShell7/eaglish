import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Reading from "@/pages/Reading";
import Dictation from "@/pages/Dictation";
import Writing from "@/pages/Writing";
import Vocabulary from "@/pages/Vocabulary";
import Slang from "./pages/Slang";
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
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function App() {
  return (
    <Routes>
      {/* Deliberately outside <Layout>: the flow needs the whole screen. */}
      <Route element={<RequireAuth />}>
        <Route path="onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<Layout />}>
        {/* Home decides for itself: a landing page when signed out, the
            dashboard when signed in. */}
        <Route index element={<Home />} />

        {/* Everything that writes progress needs an account to write it to. */}
        <Route element={<RequireAuth />}>
          <Route path="reading" element={<Reading />} />
          <Route path="dictation" element={<Dictation />} />
          <Route path="writing" element={<Writing />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="everyday-english" element={<EverydayEnglish />} />
          <Route path="slang" element={<Slang />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

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
