# Eaglish

A web app built on one idea: **you learn a word by meeting it again and again in
real context, and spaced repetition makes those meetings land.**

Every English word anywhere in the app can be looked up and saved in two taps —
in a reading text, in the writing editor, on a slang card, or in any text you
select. Saved words then come back on a spaced-repetition schedule, and they're
underlined wherever they turn up again, so you can see the repetition working.

Built with React, TypeScript and Supabase.

> The interface can be switched between English and Russian, so a complete beginner
> can navigate the app in their own language. Switching the interface never
> translates the learning material — English texts stay English.

---

## What it does

**Word capture, everywhere** — the core mechanic. Tap a word in a reading text, or
select any English text on any page, and a popup gives you a contextual
translation and a one-tap save. Words already in your queue are underlined in
reading texts, so a repeat encounter is visible rather than invisible.

**Reading** — short texts graded across three CEFR bands (A1–A2, B1–B2, C1–C2),
with sentence translation on demand. Each text ends with comprehension questions
that explain *why* an answer was right or wrong.

**Writing** — guided tasks (an informal email, an essay, a complaint, a review),
each with a structure guide, useful phrases and a sample answer you can reveal.
A Russian → English lookup sits beside the editor for the moment you know the
idea but not the word; it answers with usage notes and an example, and the word
goes straight into your review queue. Submissions are scored by AI on grammar,
vocabulary and coherence, with specific suggestions rather than a bare number.

**Vocabulary** — every saved word comes back for review on a spaced-repetition
schedule (an SM-2 style algorithm), so you revise it right before you'd forget it.
Words met outside the app can be added by hand.

**Everyday English & Slang** — idioms, slang and abbreviations people actually use,
filterable by category and saveable to your vocabulary.

**Progress & profile** — XP and levels derived from real activity, 13 achievements,
a daily streak and goal, and a dashboard with a study calendar, weekly activity,
a writing-score trend and an activity-mix breakdown.

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
| AI | Groq (`openai/gpt-oss-120b`) for translation and writing feedback |

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
| `VITE_GROQ_MODEL` | Optional. Overrides the default model — handy when a provider retires one. |
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
