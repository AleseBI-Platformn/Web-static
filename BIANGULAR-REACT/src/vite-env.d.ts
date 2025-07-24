/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PHP_SERVER_URL: string
  readonly VITE_APP_DEBUG: string
  readonly VITE_APP_API_LOGS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
