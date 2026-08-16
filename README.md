# Eaglish

A web app for learning English through **reading, writing and vocabulary**, with a
built-in AI tutor. Built with React, TypeScript and Supabase.

> The interface can be switched between English and Russian, so a complete beginner
> can navigate the app in their own language. Switching the interface never
> translates the learning material — English texts stay English.

---

## What it does

**Reading** — short texts graded across three CEFR bands (A1–A2, B1–B2, C1–C2).
Tap any word to get a contextual translation without leaving the page, save it to
your vocabulary, or translate the whole sentence. Each text ends with comprehension
questions that explain *why* an answer was right or wrong.

**Writing** — guided tasks (an informal email, an essay, a complaint, a review).
Each one comes with a structure guide, useful phrases and a full sample answer you
can reveal. Submissions are scored by AI on grammar, vocabulary and coherence, with
specific suggestions rather than a bare number.

**Vocabulary** — words saved while reading come back for review on a spaced-repetition
schedule (an SM-2 style algorithm), so you revise a word right before you'd forget it.

**Everyday English & Slang** — idioms, slang and abbreviations people actually use,
filterable by category and saveable to your vocabulary.

**Progress** — a daily streak, a daily goal, a 14-day activity strip, and per-skill
statistics.

**Listening** — not built yet; the section is a placeholder.

---

## Tech

| Area | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Routing | React Router |
| i18n | i18next (EN / RU, with correct Russian plural forms) |
| Auth & DB | Supabase |
| AI | Groq (Llama 3.3 70B) for translation and writing feedback |

Theming is driven entirely by CSS custom properties defined once in
[`src/index.css`](src/index.css), so light, dark and system themes stay consistent
without per-component overrides.

---

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in your own keys
npm run dev
```

`.env.local` needs:

| Variable | Where to get it |
| --- | --- |
| `VITE_GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys (free) |
| `VITE_SUPABASE_URL` | Supabase dashboard → your project → API |
| `VITE_SUPABASE_ANON_KEY` | Same page — the **publishable/anon** key, never the secret one |

Without keys the app still runs: translations fall back to a curated glossary and
writing feedback runs in a clearly-labelled demo mode.

The database schema (tables + row-level security) is in
[`supabase/schema.sql`](supabase/schema.sql) — run it once in the Supabase SQL editor.

---

## Known limitations

Being honest about what isn't finished:

- **Listening is a placeholder.** No audio content yet.
- **Progress is stored in `localStorage`, not Supabase.** The tables exist, but the
  client still writes locally, so progress doesn't follow you to another device.
- **The Groq key ships in the client bundle.** Fine for a personal demo, but it must
  move behind a server function before any public launch.
- **No placement test.** The CEFR level is picked manually rather than assessed.

---

## Project history

This started as a school project — a Streamlit flashcards app for memorising English
words. Working on it made it clear that vocabulary drilling alone doesn't teach a
language, so the concept was rebuilt around the skills that actually matter: reading,
writing and listening, with flashcards demoted to a supporting tool.

Eaglish is that rebuild — a new codebase rather than a patch on the old one, because
the original architecture couldn't carry accounts, progress tracking or an AI tutor.

The app was built with AI-assisted development.
