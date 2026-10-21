import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, EmailField, FormError, SubmitButton } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField } from "@/components/auth/PasswordField";

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    // Back to whatever they were trying to reach when the wall stopped them.
    navigate(returnTo, { replace: true });
  };

  return (
    <AuthCard
      title={t("auth.logIn")}
      onSubmit={handleSubmit}
      footer={
        <p className="auth-foot">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="auth-link">
            {t("auth.createAccount")}
          </Link>
        </p>
      }
    >
      <EmailField value={email} onChange={setEmail} />

      <PasswordField
        label={t("auth.password")}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      <FormError message={error} />

      {/* The same slot the sign-up page gives its consent checkbox, so the
          two screens have one shape: title, two fields, one small line, the
          button, then the other way in. */}
      <Link to="/forgot-password" className="auth-link auth-aside">
        {t("auth.forgotPassword")}
      </Link>

      <SubmitButton loading={loading} label={t("auth.logIn")} />

      <GoogleButton label={t("auth.continueWithGoogle")} />
    </AuthCard>
  );
}
