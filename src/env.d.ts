/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly NOTIFY_EMAIL: string;
  readonly FROM_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
