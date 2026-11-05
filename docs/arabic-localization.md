# Arabic localization — implementation checkpoint

Status: **preview only, not a complete Arabic release**. Do not enable or deploy
Arabic to production until the remaining material has been translated and checked.
The owner's admin interface stays Russian when the learner language is Arabic.

## Implemented and checked

- 1,337 Arabic UI values, including the six Arabic plural categories. Coverage
  matches all existing Russian UI keys except admin and visit statistics.
- Natural Modern Standard Arabic for navigation, authentication, onboarding,
  profile, reading controls, vocabulary, exercises, subscription screens, privacy
  controls, and their accessible labels.
- 661-entry offline English–Arabic dictionary, with matching English headwords.
- 269 authored content translations: placement explanations, error messages,
  chat abbreviations, common lesson instructions, module descriptions, and the
  first four-lesson Slang block including review.
- EN / RU / AR selector, language setting in profile, persistent local selection,
  complete reload when switching, and `lang` / `dir` on the document.
- Arabic content and interface bundles load only for Arabic sessions, before
  static course modules are evaluated. Existing `titleRu` / `translationRu` field
  names remain stable to preserve progress and data compatibility.
- Arabic AI instructions adapt only system prompts. English targets, JSON keys,
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

The current corpus check finds **17,119 untranslated authored fragments** out of
17,388. This is separate from the completed UI and offline dictionary counts.
Most are sentence translations and glossaries in the reading/listening libraries.

1. Translate the rest of Slang, everyday lessons and their context-sensitive
   explanations, distractors, prompts, register notes, and dialogue glosses.
2. Translate reading/listening sentence translations, glossaries, topic pool and
   the legal documents. English learning texts and correct answers stay English.
3. Audit hardcoded English UI versus intentional English teaching material.
   The Russian-source coverage checker is not a substitute for that audit.
4. Review all generated and historical personalized content paths after changing
   language. Existing Arabic/Russian personal libraries are currently separate.
5. Exercise real authenticated AI flows (lookup, two-way translator, explanations,
   sentence feedback, writing, personalized text) against the deployed endpoint.
   Current AI checks verify request adaptation; they are not live model tests.
6. Localize account confirmation/reset emails using the authentication service's
   supported templates and language metadata. No auth templates were changed.
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

Choose AR in onboarding or profile. Demo progress stays local.

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
- The complete first block is scanned for remaining Cyrillic text.
- Placeholder integrity, dictionary headwords, all UI keys and Arabic plurals
  are checked. AI localization leaves learner input untouched.
- Browser verified onboarding → AR reload → first lesson/English dialogue →
  profile → RU reload; `ar/rtl` and `ru/ltr`, no horizontal overflow at 390px,
  and no browser console errors. Screenshot: `arabic-preview/dialogue.jpg`.
- Production-mode smoke build passed using local demo configuration; it was
  not a production deployment. Existing large-chunk warnings remain.
- Lint has existing warnings elsewhere; no unrelated cleanup is included.

No OpenAI batch translations completed: the configured API account reported
`credit_balance_exhausted`. Arabic text in this checkpoint was authored in the
assistant session, without further paid translation API requests.
