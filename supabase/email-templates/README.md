# Auth email templates

The HTML Supabase sends for signup confirmation, password reset and email change.
Kept in the repo because the dashboard is the only place they live otherwise — if
the project is ever recreated, these are the source.

## Where to paste them

Dashboard → **Authentication → Emails → Templates**, one tab per file:

| Tab | File | Subject |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | Confirm your Eaglish account / Подтверди аккаунт в Eaglish |
| Reset password | `reset-password.html` | Reset your Eaglish password / Сброс пароля в Eaglish |
| Change email address | `change-email.html` | Confirm your new Eaglish address / Подтверди новый адрес |

Paste the body, set the subject, save. Each template also needs its subject line
changed — that is what the inbox list shows, so it matters more than the body.

## Variables

Supabase substitutes these server-side; anything else renders empty:

- `{{ .ConfirmationURL }}` — the action link (already carries the token)
- `{{ .Token }}` / `{{ .TokenHash }}` — the 6-digit code, if you ever want code entry
- `{{ .Email }}`, `{{ .NewEmail }}` — the addresses involved
- `{{ .SiteURL }}`, `{{ .RedirectTo }}`

## Sender name — the part templates can't fix

The body is ours, but **"from" is not**. On Supabase's built-in email service the
sender is fixed (`noreply@mail.app.supabase.io`), so the inbox still shows
Supabase as the sender no matter what the template says.

To make it read *Eaglish*, the project needs **custom SMTP** (Authentication →
Emails → SMTP Settings), where sender name and address are ours to set. Free
options: Brevo (300/day, can send from a verified single address such as a Gmail
one) or Resend (3 000/month, but sending from your own domain requires owning
one). Until then the built-in service is also rate-limited and meant for
testing — fine while it's us and a few testers, not enough for real signups.

## Bilingual on purpose

The interface switches RU/EN, but a Supabase template can't branch on the
language the user picked — there is one body per event. So each email says it in
English first and repeats the essentials in Russian, rather than guessing wrong.
