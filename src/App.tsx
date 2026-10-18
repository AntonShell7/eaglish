import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Reading from "@/pages/Reading";
import Dictation from "@/pages/Dictation";
import Writing from "@/pages/Writing";
import Vocabulary from "@/pages/Vocabulary";
import Slang from "./pages/Slang";
import ResetPassword from "@/pages/ResetPassword";
import Admin from "@/pages/Admin";
import ProgressPage from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Pricing from "@/pages/Pricing";
import Offer from "@/pages/Offer";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequirePlan } from "@/components/access/RequirePlan";

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
          {/* The shelf, a topic, and a text, each with its own address: the
              back button goes up a level instead of out of the section, a
              reload lands where it left, and a text can be sent to somebody. */}
          {/* Free, and all of it. Reading is where words come from, and the
              rest of the product is built on the claim that you learn a word
              by meeting it somewhere you wanted to be. Rationing that leaves
              nothing to sell later. */}
          <Route path="reading" element={<Reading />} />
          <Route path="reading/:topic" element={<Reading />} />
          <Route path="reading/:topic/:textId" element={<Reading />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="progress" element={<ProgressPage />} />

          {/* Everyday English merged into Slang; the old address is in links
              and in people's history, so it still arrives somewhere useful.
              Outside the plan gate, so the redirect happens first and the
              paywall then names Slang rather than a path nobody recognises. */}
          <Route path="everyday-english" element={<Navigate to="/slang" replace />} />

          {/* Paid. The sections that use what the free account collected —
              see PRO_SECTIONS, which this guard reads the section name from. */}
          <Route element={<RequirePlan />}>
            <Route path="dictation" element={<Dictation />} />
            <Route path="dictation/:topic" element={<Dictation />} />
            <Route path="dictation/:topic/:id" element={<Dictation />} />
            <Route path="writing" element={<Writing />} />
            <Route path="slang" element={<Slang />} />
            <Route path="slang/:topic" element={<Slang />} />
            <Route path="slang/:topic/:id" element={<Slang />} />
          </Route>

          <Route path="profile" element={<Profile />} />
          {/* Behind the auth wall like everything else; the real gate is the
              account check inside the edge function this page calls. */}
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        {/* Public on purpose: a payment provider's moderator reads this page
            before approving anything, and a price behind a sign-in is a price
            nobody sees. */}
        <Route path="pricing" element={<Pricing />} />
        {/* The contract money is paid under. Public, and findable at its
            own address, because that is where a provider's moderator
            looks for it. */}
        <Route path="offer" element={<Offer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
