import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, EmailField, FormError, SubmitButton } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
    navigate("/");
  };

  return (
    <AuthCard
      title={t("auth.logIn")}
      onSubmit={handleSubmit}
      footer={
        <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-semibold" style={{ color: "var(--color-primary)" }}>
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

      <Link
        to="/forgot-password"
        className="mt-3 inline-block text-xs font-medium"
        style={{ color: "var(--color-primary)" }}
      >
        {t("auth.forgotPassword")}
      </Link>

      <SubmitButton loading={loading} label={t("auth.logIn")} />
    </AuthCard>
  );
}
