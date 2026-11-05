"""Run on the VPS after uploading public/email-templates/*.html.

Updates only mail template URLs and subjects; never reads or changes .env.
The auth service needs to be recreated after reviewing the resulting diff.
"""
from pathlib import Path
import re
import shutil

path = Path('/opt/supabase/docker/docker-compose.yml')
original = path.read_text()
settings = {
    'GOTRUE_MAILER_TEMPLATES_CONFIRMATION': 'https://eaglish.ru/email-templates/confirm-signup.html',
    'GOTRUE_MAILER_TEMPLATES_RECOVERY': 'https://eaglish.ru/email-templates/reset-password.html',
    # GoTrue subjects are static, so the short subject identifies the action in
    # all supported languages; the message body uses the account's preference.
    'GOTRUE_MAILER_SUBJECTS_CONFIRMATION': 'Eaglish · Confirm email / تأكيد البريد / Подтверждение почты',
    'GOTRUE_MAILER_SUBJECTS_RECOVERY': 'Eaglish · Reset password / إعادة تعيين كلمة المرور / Сброс пароля',
}
anchor = re.search(r'^([ \t]+)GOTRUE_MAILER_TEMPLATES_CONFIRMATION:.*$', original, re.M)
if not anchor:
    raise SystemExit('Existing confirmation-template configuration not found; no changes made.')
indent = anchor.group(1)
updated = original
for key, value in settings.items():
    line = f'{indent}{key}: "{value}"'
    pattern = rf'^[ \t]*{key}:.*$'
    if re.search(pattern, updated, re.M):
        updated = re.sub(pattern, lambda _: line, updated, flags=re.M)
    else:
        updated = updated.replace(anchor.group(0), anchor.group(0) + '\n' + line, 1)
        # The original anchor changes after its own replacement above.
        if line not in updated:
            marker = re.search(r'^[ \t]+GOTRUE_MAILER_TEMPLATES_CONFIRMATION:.*$', updated, re.M).group(0)
            updated = updated.replace(marker, marker + '\n' + line, 1)
if updated != original:
    backup = path.with_name('docker-compose.before-localized-emails.yml.bak')
    if not backup.exists():
        shutil.copy2(path, backup)
    path.write_text(updated)
    print('Updated email template configuration; previous file retained as backup.')
else:
    print('Email template configuration already matches.')
