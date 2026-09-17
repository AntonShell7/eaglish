# Файл автоматической выкатки

`deploy-regru.yml` — сборка сайта и заливка на хостинг reg.ru при каждом
изменении в ветке `main`.

Его нельзя отправить обычным `git push`: у токена нет права записывать файлы
автоматизации, GitHub такой push отклоняет. Поэтому файл лежит здесь, а рабочая
копия создаётся вручную через сайт GitHub — **Actions** → **New workflow** →
**set up a workflow yourself** — и сохраняется по пути
`.github/workflows/deploy-regru.yml`.

Меняя этот файл, нужно повторить вставку: рабочая копия живёт только на GitHub.

## Что должно лежать в Secrets репозитория

`Settings` → `Secrets and variables` → `Actions`:

| Имя | Что это |
|---|---|
| `FTP_SERVER` | адрес SFTP хостинга reg.ru |
| `FTP_USERNAME` | логин SFTP |
| `FTP_PASSWORD` | пароль SFTP |
| `FTP_DIR` | папка сайта на хостинге, например `/var/www/USER/data/www/eaglish.ru` |
| `VITE_SUPABASE_URL` | адрес проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | публичный ключ Supabase |

`GROQ_API_KEY` сюда **не добавляется**: ключ живёт только в настройках Vercel,
и сборке, которая идёт на GitHub, он не нужен и не должен быть виден.
