# Arabic localization

Arabic release coverage is complete: **17,388 / 17,388 authored fragments**,
plus **1,413 interface values** and **661 offline dictionary entries**.
The English learning material, accepted answers, course identifiers and audio remain English.
The admin console remains Russian for an Arabic learner account.

## Behavior

- First-language selection appears before the first visit. The public introduction
  remains below it. Arabic, Russian and English are available.
- A prominent First language section in the profile changes the learner language.
  Switching reloads the document so static course content changes consistently.
- The EN/native toggle changes interface language without replacing an Arabic
  learner's Arabic explanations with Russian ones.
- Arabic interface uses RTL; English passages, dialogue, answer fields and word
  assembly retain LTR. Arabic bundles load only for Arabic learners.
- Navigation, authentication, onboarding, profile, subscription screens, legal
  documents, vocabulary, course explanations and reading/listening translations
  are localized. Admin and visit-statistics UI are intentionally excluded.
- Arabic AI system instructions request natural Modern Standard Arabic while
  preserving English teaching targets, JSON keys and learner input.
- Lookup caches and personal generated-reading libraries are separated by language.
  Existing Russian personal texts are preserved, not retroactively translated.
- Saved vocabulary originals remain intact; display/cache uses the learner language.
- Confirmation/recovery email templates use first_language metadata, with Russian
  fallback for existing accounts lacking metadata. Templates and auth configuration
  were deployed and the recreated auth service verified healthy. No email was sent.
- Existing visit consent and administrator/test-account exclusions remain in force,
  including on the first-language welcome screen.
- Prices, payment provider, currency and subscription logic are unchanged.

## Validation

Passed:

```sh
node scripts/check-arabic.mjs --release
node scripts/test-arabic-runtime.cjs --release
npx tsc -b
npm run lint
```

The release gate checks every source fragment, all non-admin UI keys, Arabic plural
categories, dictionary headwords and interpolation placeholders. Runtime checks scan
all localized course and reading/listening data for untranslated Russian and verify
unchanged English strings, IDs, steps, choice indices and accepted answers. The
production build explicitly enables Arabic and runs the coverage gate again.

Lint reports 18 existing warnings and no errors. Vite reports existing large chunks
and a mixed static/dynamic reading-index import. The complete Arabic content bundle
is loaded only by Arabic learners.

Browser checks covered language selection, Arabic persistence/reload, onboarding,
profile, RU switching, pricing, legal pages, English dialogue/reading/comprehension,
Arabic word and sentence translation, and LTR dictation input. Mobile checks at 390px
found no horizontal overflow in the tested views. Admin uses an isolated i18next
instance so opening it cannot overwrite the learner preference.

Screenshots are in `arabic-preview/`. Translation used authorized Groq calls and
manual work in the assistant session. Weak-model output and incomplete numeric-key
batches were removed; later batches used immutable source hashes. Context-specific
glossary overrides and manual editorial corrections are separate from generated data.
No user records or credentials were sent as part of the translation corpus.

## External-service verification limits

Synthetic live calls through the local API handler to Groq passed for lookup,
Arabic-to-English hints and sentence feedback. Real authenticated production AI
flows were not exercised, and OpenAI vision remains dependent on the exhausted
OpenAI API balance. No purchase or email-delivery test was performed. Provider-hosted
checkout language is controlled by the payment provider, not these site translations.

## Deployment

Build with the current VPS Supabase public anon key, `https://db.eaglish.ru`,
`VITE_DEMO_MODE=false`, `VITE_API_BASE=https://eaglish.vercel.app`, the current admin ID,
and `VITE_ENABLE_ARABIC=true`. Do not use the retired hosted database in `.env.local`.
Publish `dist/` to the VPS without deleting existing audio or verification files.
GitHub alone does not update eaglish.ru; the VPS upload is required.

Production verification: eaglish.ru served matching SHA-256 hashes for the HTML
and full Arabic content bundle; the main bundle returned HTTP 200. The public
first-language screen switched to Arabic and the registration/login forms used
Arabic labels. A narrow-screen guest-header overflow was found and corrected by
allowing wrapping while keeping the language switch accessible. Vercel's production
API deployment reached READY for the release commit on main.
