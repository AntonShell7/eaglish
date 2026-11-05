# Arabic localization — implementation checkpoint

Status: **preview only, not a complete Arabic release**. Do not enable or deploy
Arabic to production until the remaining material has been translated and checked.
The owner's admin interface stays Russian when the learner language is Arabic.

## Implemented and checked

- Arabic UI values, including the six Arabic plural categories. Coverage
  matches all existing Russian UI keys except admin and visit statistics.
- Natural Modern Standard Arabic for navigation, authentication, onboarding,
  profile, reading controls, vocabulary, exercises, subscription screens, privacy
  controls, and their accessible labels.
- 661-entry offline English–Arabic dictionary, with matching English headwords.
- Authored content translations: placement explanations, error messages,
  chat abbreviations, common lesson instructions, module descriptions, and the
  complete Slang course and everyday dialogue explanations, including reviews.
- First-language welcome screen and profile cards; EN / native-language toggle, persistent local selection,
  complete reload when switching, and `lang` / `dir` on the document.
- Arabic content and interface bundles load only for Arabic sessions, before
  static course modules are evaluated. Existing `titleRu` / `translationRu` field
  names remain stable to preserve progress and data compatibility.
- Arabic AI instructions adapt system prompts and authored instruction templates. English targets, JSON keys,
  and learner-submitted text are preserved. Translation validation accepts Arabic;
  lookup caches are separated from Russian. An unlocalized Russian glossary entry
  is not returned as an Arabic translation.
- Saved vocabulary originals remain intact. Display uses the current language's
  translation/cache, and backfill can populate that language without overwriting
  another language's existing translation.
- Generated personal reading texts are stored separately for Arabic, preserving
  existing Russian texts. This does not translate historical generated texts.
- English exercises and input fields retain LTR direction. Arabic UI uses RTL.

## Remaining before release

Groq reached its daily token quota. Translation continues manually in the assistant session.
Run the coverage command for current counts. Legal documents have been manually
translated separately in `ar-legal.json`. The corpus totals are separate from UI
and offline dictionary counts.
The remaining fragments are sentence translations and other supporting text in
the reading/listening libraries. The 2,001-entry pending glossary queue is complete.

1. All TS/TSX-authored supporting text, including the full Slang course and
   everyday dialogue explanations, has been translated. Full-course runtime
   checks find no Russian, with English strings and answer indices unchanged.
2. Finish reading/listening sentence translations and topic-pool supporting text.
   Legal documents are translated. English learning texts and correct answers stay English.
3. Audit hardcoded English UI versus intentional English teaching material.
   The Russian-source coverage checker is not a substitute for that audit.
4. Review all generated and historical personalized content paths after changing
   language. Existing Arabic/Russian personal libraries are currently separate.
5. Exercise real authenticated AI flows (lookup, two-way translator, explanations,
   sentence feedback, writing, personalized text) against the deployed endpoint.
   Synthetic live checks via the local API handler passed for lookup, hints and
   sentence feedback; production authentication and remaining flows are not verified.
6. Deploy the localized confirmation/reset templates and auth configuration.
   First-language metadata is passed during registration and updated on sign-in.
7. Review checkout/provider-hosted language support independently. No payment
   integration, currency, price, or subscription behavior was changed.
8. Complete desktop/mobile browser walkthroughs for all pages and exercises,
   including RTL mixed text, input, sentence assembly, tables, charts, messages,
   loading/error/empty states, and admin isolation.
9. Complete editorial review, especially Arabic number agreement, idioms,
   profanity/register, legal text and context-dependent short translations.

## Preview

Arabic is enabled in Vite development, and hidden in ordinary production builds.
A production build explicitly setting `VITE_ENABLE_ARABIC=true` runs the full
coverage gate and currently fails intentionally. No incomplete Arabic UI has
been deployed to eaglish.ru.

For a local demo with no real user database, without editing environment files:

```sh
VITE_SUPABASE_URL='' VITE_SUPABASE_ANON_KEY='' VITE_DEMO_MODE=true npm run dev -- --host 127.0.0.1 --port 5174
```

Choose Arabic on the first-language screen or in the profile. Demo progress stays local.

## Verification

```sh
node scripts/check-arabic.mjs
node scripts/test-arabic-runtime.cjs
npx tsc -b
npm run lint
node scripts/check-arabic.mjs --release # intentionally fails until corpus is complete
```

- Runtime tests verify identical course/module/lesson identities, step counts,
  correct-choice indices, and accepted English answers across RU/AR.
- The complete course is scanned for remaining Cyrillic text.
- Placeholder integrity, dictionary headwords, all UI keys and Arabic plurals
  are checked. AI localization leaves learner input untouched.
- Browser verified onboarding → AR reload → first lesson/English dialogue →
  profile → RU reload; `ar/rtl` and `ru/ltr`, no horizontal overflow at 390px,
  and no browser console errors. Screenshot: `arabic-preview/dialogue.jpg`.
- Production-mode smoke build passed using local demo configuration; it was
  not a production deployment. Existing large-chunk warnings remain.
- Lint has existing warnings elsewhere; no unrelated cleanup is included.

OpenAI translation was unavailable (`credit_balance_exhausted`). The owner
authorized Groq translation of authored content, with manual translation in the
assistant session if Groq quotas are exhausted. No user records or credentials
are included in the translation corpus.

The first-language/profile flow was checked in the browser. Arabic persists on
reload; the admin locale uses an isolated i18next instance with no browser-language
cache. Screenshot: `arabic-preview/profile.jpg`. Runtime checks also preserve all
English strings in course and reading/listening JSON, and verify that selecting
English UI does not change an Arabic learner's translation language.

Checkpoint after manual fallback: 11,612 / 17,388 authored fragments covered;
5,776 JSON library fragments remain. Manual fallback completed 1,923 TS/TSX
fragments plus 3,651 JSON fragments (all 2,001 pending glossary entries and
1,650 sentence/supporting translations). English source sentences were used
directly for contextual checking, including correction of inaccurate Russian glosses.
These counts exclude 1,412 interface values and 661 offline dictionary entries.
No further bulk API requests were made after the Groq daily quota was exhausted.
125 contextual glossary overrides distinguish English words that shared one
Russian gloss. Incomplete numeric-key Groq batches were removed and queued for
retranslation; subsequent batches used exact source strings as keys.

Live local-handler → Groq checks passed for word lookup, Arabic-to-English hint,
and sentence feedback, using synthetic learning examples. This did not test
production authentication or OpenAI vision (the OpenAI balance remains empty).
