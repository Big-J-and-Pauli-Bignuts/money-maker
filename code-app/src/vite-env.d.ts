/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TENANT_ID: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_REDIRECT_URI: string;
  readonly VITE_DATAVERSE_URL: string;
  readonly VITE_DATAVERSE_API_VERSION: string;
  readonly VITE_SHAREPOINT_SITE_URL: string;
  readonly VITE_SHAREPOINT_TENANT: string;
  readonly VITE_GRAPH_API_ENDPOINT: string;
  readonly VITE_SPEECH_KEY: string;
  readonly VITE_SPEECH_REGION: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT: string;
  readonly VITE_POWER_AUTOMATE_ENVIRONMENT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
