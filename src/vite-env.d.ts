/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute URL of the model endpoint when it is not on this origin. */
  readonly VITE_AI_ENDPOINT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
