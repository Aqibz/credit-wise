declare const __APP_VERSION__: string;

const releaseFromEnv = import.meta.env.VITE_APP_RELEASE;

export const APP_RELEASE = typeof releaseFromEnv === "string" && releaseFromEnv.trim().length > 0
  ? releaseFromEnv.trim()
  : typeof __APP_VERSION__ === "string" && __APP_VERSION__.trim().length > 0
    ? `v${__APP_VERSION__.trim()}`
    : "local";
