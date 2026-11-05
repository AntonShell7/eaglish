/** Public messages: never expose raw infrastructure errors to learners. */
export function authError(error: { code?: string; message?: string; status?: number }, ru: boolean): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (code === "weak_password" || /password.*(weak|short|least|characters)/.test(message))
    return ru ? "Создай более надёжный пароль: используй не меньше 8 символов, буквы, цифры и специальный символ." : "Choose a stronger password: use at least 8 characters, letters, numbers and a symbol.";
  if (code === "user_already_exists" || code === "email_exists")
    return ru ? "Этот email уже зарегистрирован. Войди или восстанови пароль." : "This email is already registered. Sign in or reset your password.";
  if (code === "email_address_invalid")
    return ru ? "Проверь адрес электронной почты — кажется, в нём опечатка." : "Check your email address for a typo.";
  if (error.status === 429 || code.includes("rate_limit"))
    return ru ? "Слишком много попыток. Подожди немного и попробуй снова." : "Too many attempts. Please wait a little and try again.";
  if (code === "request_timeout" || /timed? ?out|timeout|deadline/.test(message))
    return ru ? "Не удалось завершить запрос. Подожди минуту и попробуй ещё раз. Если включён VPN, попробуй временно отключить его. Менять пароль не нужно." : "We couldn't complete the request. Wait a minute and try again. If you use a VPN, try temporarily turning it off. You don't need to change your password.";
  if (/fetch|network/.test(message))
    return ru ? "Проверь подключение к интернету. Если включён VPN, попробуй временно отключить его и повторить попытку." : "Check your internet connection. If you use a VPN, try temporarily turning it off and retry.";
  return ru ? "Сейчас не удалось выполнить запрос. Попробуй ещё раз чуть позже." : "We couldn't complete the request right now. Please try again shortly.";
}
