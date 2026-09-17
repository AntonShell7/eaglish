-- The shared word cache.
--
-- Tapping a word is the app's central gesture, and every tap used to cost a
-- model call — up to two, since the Russian translation and the English
-- explanation are fetched separately. On the free tier that caps the whole
-- product at roughly five hundred taps a day across all users, which a dozen
-- active readers reach in a week.
--
-- But vocabulary is Zipf-distributed: a few thousand words account for most of
-- what anyone meets, and readers of the same library meet the same words. So a
-- lookup is worth computing once for everyone rather than once per person. The
-- curated per-text glossary already worked this way; this is the same idea,
-- global and filled in as people read.
--
-- Entries are keyed by the word alone, without the sentence it appeared in.
-- That is a deliberate trade: a polysemous word in an unusual context can get
-- the common sense rather than the exact one. It is the same trade the curated
-- glossaries make, the popup only ever showed one meaning anyway, and paying a
-- model call per occurrence to sharpen the rare case is not worth losing the
-- common one.
create table if not exists word_cache (
  word text primary key check (char_length(word) between 1 and 80),

  -- Filled by the Russian lookup.
  translation text,
  part_of_speech text,

  -- Filled by the English explanation, independently: a word can be cached for
  -- one mode long before anyone asks for the other.
  definition text,
  example text,
  synonyms text[],

  hits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table word_cache enable row level security;

-- Readable by everyone, including signed-out visitors: the cache is a
-- dictionary, and a dictionary nobody may read is useless. It holds no personal
-- data — which words a given learner looked up stays in vocabulary_words.
drop policy if exists "Anyone can read the word cache" on word_cache;
create policy "Anyone can read the word cache" on word_cache
  for select to anon, authenticated using (true);

-- Only signed-in users may add to it, and only through the app, which writes
-- what the model returned. Worst case a bad entry is served to others, so
-- entries stay correctable rather than permanent.
drop policy if exists "Signed-in users can fill the word cache" on word_cache;
create policy "Signed-in users can fill the word cache" on word_cache
  for insert to authenticated with check (true);

drop policy if exists "Signed-in users can complete a cached word" on word_cache;
create policy "Signed-in users can complete a cached word" on word_cache
  for update to authenticated using (true) with check (true);

create index if not exists word_cache_hits_idx on word_cache (hits desc);
