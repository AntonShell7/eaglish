import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, EmailField, FormError, SubmitButton } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";

export default function Register() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("auth.passwordsDontMatch"));
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp(email, password);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    setDone(true);
    // Straight into onboarding: the answers are stored locally, so the flow
    // works while the confirmation email is still in flight.
    setTimeout(() => navigate("/onboarding"), 1600);
  };

  return (
    <AuthCard
      title={t("auth.signUp")}
      onSubmit={handleSubmit}
      footer={
        <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
            {t("auth.logIn")}
          </Link>
        </p>
      }
    >
      {done ? (
        <p className="mt-6 text-sm" style={{ color: "var(--color-success)" }}>
          {t("auth.checkEmail")}
        </p>
      ) : (
        <>
          <EmailField value={email} onChange={setEmail} />

          <PasswordField
            label={t("auth.password")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            showStrength
            hint={t("auth.passwordHint")}
          />

          <PasswordField
            label={t("auth.confirmPassword")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            error={mismatch ? t("auth.passwordsDontMatch") : null}
          />

          <FormError message={error} />

          <SubmitButton loading={loading} label={t("auth.createAccount")} />
        </>
      )}
    </AuthCard>
  );
}
